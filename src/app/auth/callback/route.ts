import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const returnTo = searchParams.get("returnTo");

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Upsert profile row
    if (data.session?.user) {
      const { id, email } = data.session.user;
      await supabase.from("profiles").upsert(
        { id, email: email ?? null },
        { onConflict: "id" }
      );
    }
  }

  // Redirect to returnTo if it's a safe relative path, else /dashboard
  const destination =
    returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard";

  return NextResponse.redirect(`${origin}${destination}`);
}
