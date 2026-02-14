import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";

const PROTECTED = ["/dashboard", "/training", "/progress", "/settings"];

function makeSupabase(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, getResponse: () => response };
}

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { supabase, getResponse } = makeSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // Signed-in user visiting /login → redirect to dashboard
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Protected route without session → redirect to /login?returnTo=...
  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    const returnTo = pathname + search;
    url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and API routes.
     * This ensures session cookies are refreshed on every page navigation.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
