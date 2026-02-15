import { createClient } from "./client";
import type {
  LfgPost,
  LookingFor,
  Region,
  MessageThread,
  Message,
} from "@/src/lib/matchmaking";
import { MESSAGE_COOLDOWN_SEC } from "@/src/lib/matchmaking";
import { isMessageCooldownActive } from "./moderation";

// ── LFG Posts ──

/** Fetch open LFG posts, newest first. Joins display_name from profiles. */
export async function fetchOpenPosts(
  blockedUserIds?: Set<string>
): Promise<LfgPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lfg_posts")
    .select("*, profiles:user_id(display_name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("[aerix] fetchOpenPosts failed:", error);
    return [];
  }

  let posts = (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    display_name:
      (row.profiles as { display_name?: string } | null)?.display_name ??
      "Player",
  })) as LfgPost[];

  // Filter out blocked users client-side
  if (blockedUserIds && blockedUserIds.size > 0) {
    posts = posts.filter((p) => !blockedUserIds.has(p.user_id));
  }

  return posts;
}

/** Fetch a single LFG post by ID. */
export async function fetchPost(postId: string): Promise<LfgPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("lfg_posts")
    .select("*, profiles:user_id(display_name)")
    .eq("id", postId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    display_name:
      (data.profiles as { display_name?: string } | null)?.display_name ??
      "Player",
  } as LfgPost;
}

/** Count the user's currently open posts. */
export async function countUserOpenPosts(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("lfg_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "open");

  return count ?? 0;
}

/** Create a new LFG post. */
export async function createPost(fields: {
  looking_for: LookingFor;
  rank: string;
  playlist: string;
  region: Region;
  note: string;
}): Promise<LfgPost | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("lfg_posts")
    .insert({
      user_id: user.id,
      ...fields,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    console.warn("[aerix] createPost failed:", error);
    return null;
  }
  return data as LfgPost;
}

/** Close (mark as filled) one of the user's posts. */
export async function closePost(postId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("lfg_posts")
    .update({ status: "closed" })
    .eq("id", postId)
    .eq("user_id", user.id);
}

// ── Message Threads ──

/** Get or create a thread between the current user and a post's author. */
export async function getOrCreateThread(
  postId: string,
  receiverId: string
): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Check for existing thread where current user is the starter
  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .eq("post_id", postId)
    .eq("starter_id", user.id)
    .single();

  if (existing) return existing.id;

  // Create new thread
  const { data, error } = await supabase
    .from("message_threads")
    .insert({
      post_id: postId,
      starter_id: user.id,
      receiver_id: receiverId,
    })
    .select("id")
    .single();

  if (error) {
    console.warn("[aerix] getOrCreateThread failed:", error);
    return null;
  }
  return data?.id ?? null;
}

/** Fetch threads for current user, filtering out blocked users. */
export async function fetchThreads(
  blockedUserIds?: Set<string>
): Promise<MessageThread[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Threads where user is starter
  const { data: starterThreads } = await supabase
    .from("message_threads")
    .select("*, profiles:receiver_id(display_name)")
    .eq("starter_id", user.id)
    .order("created_at", { ascending: false });

  // Threads where user is receiver
  const { data: receiverThreads } = await supabase
    .from("message_threads")
    .select("*, profiles:starter_id(display_name)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  let all = [
    ...((starterThreads ?? []) as Record<string, unknown>[]).map((t) => ({
      ...t,
      other_user_name:
        (t.profiles as { display_name?: string } | null)?.display_name ??
        "Player",
      unread_count: (t as Record<string, number>).starter_unread_count ?? 0,
    })),
    ...((receiverThreads ?? []) as Record<string, unknown>[]).map((t) => ({
      ...t,
      other_user_name:
        (t.profiles as { display_name?: string } | null)?.display_name ??
        "Player",
      unread_count: (t as Record<string, number>).receiver_unread_count ?? 0,
    })),
  ] as MessageThread[];

  // Filter out threads with blocked users
  if (blockedUserIds && blockedUserIds.size > 0) {
    all = all.filter((t) => {
      const otherId =
        t.starter_id === user.id ? t.receiver_id : t.starter_id;
      return !blockedUserIds.has(otherId);
    });
  }

  // Sort by last activity desc
  all.sort(
    (a, b) =>
      new Date(b.last_message_at ?? b.created_at).getTime() -
      new Date(a.last_message_at ?? a.created_at).getTime()
  );

  return all;
}

/** Fetch a single thread by ID. */
export async function fetchThread(
  threadId: string
): Promise<MessageThread | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("message_threads")
    .select("*")
    .eq("id", threadId)
    .single();

  if (error || !data) return null;
  return data as MessageThread;
}

// ── Messages ──

/** Fetch messages in a thread, oldest first. */
export async function fetchMessages(threadId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.warn("[aerix] fetchMessages failed:", error);
    return [];
  }
  return (data ?? []) as Message[];
}

/** Accept a pending thread request. Only the receiver (post owner) can accept. */
export async function acceptThread(threadId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("message_threads")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", threadId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.warn("[aerix] acceptThread failed:", error);
    return false;
  }
  return true;
}

/** Decline a pending thread request. Only the receiver (post owner) can decline. */
export async function declineThread(threadId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("message_threads")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", threadId)
    .eq("receiver_id", user.id)
    .eq("status", "pending");

  if (error) {
    console.warn("[aerix] declineThread failed:", error);
    return false;
  }
  return true;
}

/** Send a message in a thread. Includes server-side cooldown check. */
export async function sendMessage(
  threadId: string,
  body: string
): Promise<Message | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Check thread is accepted before allowing messages
  const { data: threadCheck } = await supabase
    .from("message_threads")
    .select("status")
    .eq("id", threadId)
    .single();

  if (!threadCheck || threadCheck.status !== "accepted") {
    console.warn("[aerix] sendMessage blocked: thread not accepted");
    return null;
  }

  // Server-side cooldown check
  const onCooldown = await isMessageCooldownActive(
    threadId,
    MESSAGE_COOLDOWN_SEC
  );
  if (onCooldown) {
    console.warn("[aerix] message cooldown active");
    return null;
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      sender_id: user.id,
      body: body.trim().slice(0, 500),
    })
    .select()
    .single();

  if (error) {
    console.warn("[aerix] sendMessage failed:", error);
    return null;
  }

  // Fetch thread to determine which unread counter to increment
  const { data: thread } = await supabase
    .from("message_threads")
    .select("starter_id, receiver_id, starter_unread_count, receiver_unread_count")
    .eq("id", threadId)
    .single();

  const updateFields: Record<string, unknown> = {
    last_message: body.trim().slice(0, 120),
    last_message_at: new Date().toISOString(),
  };

  if (thread) {
    if (user.id === thread.starter_id) {
      updateFields.receiver_unread_count = (thread.receiver_unread_count ?? 0) + 1;
    } else {
      updateFields.starter_unread_count = (thread.starter_unread_count ?? 0) + 1;
    }
  }

  await supabase
    .from("message_threads")
    .update(updateFields)
    .eq("id", threadId);

  return data as Message;
}

/** Mark a thread as read for the current user. */
export async function markThreadRead(threadId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: thread } = await supabase
    .from("message_threads")
    .select("starter_id")
    .eq("id", threadId)
    .single();

  if (!thread) return;

  const col =
    user.id === thread.starter_id
      ? "starter_unread_count"
      : "receiver_unread_count";

  await supabase
    .from("message_threads")
    .update({ [col]: 0 })
    .eq("id", threadId);
}

/** Get total unread message count across all threads for the current user. */
export async function fetchTotalUnreadCount(): Promise<number> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  // Threads where user is starter
  const { data: starterThreads } = await supabase
    .from("message_threads")
    .select("starter_unread_count")
    .eq("starter_id", user.id)
    .gt("starter_unread_count", 0);

  // Threads where user is receiver
  const { data: receiverThreads } = await supabase
    .from("message_threads")
    .select("receiver_unread_count")
    .eq("receiver_id", user.id)
    .gt("receiver_unread_count", 0);

  let total = 0;
  for (const t of starterThreads ?? []) {
    total += (t as Record<string, number>).starter_unread_count ?? 0;
  }
  for (const t of receiverThreads ?? []) {
    total += (t as Record<string, number>).receiver_unread_count ?? 0;
  }
  return total;
}
