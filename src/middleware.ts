import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";

const LOCALES = ["en", "es", "pt-BR", "fr", "de"];
const DEFAULT_LOCALE = "en";

const PROTECTED = [
  "/dashboard",
  "/training",
  "/progress",
  "/settings",
  "/rank",
  "/matchmaking",
  "/messages",
  "/onboarding",
  "/invite",
];

function getPathLocale(pathname: string): string | null {
  const segments = pathname.split("/");
  const candidate = segments[1];
  return LOCALES.includes(candidate) ? candidate : null;
}

function detectLocale(request: NextRequest): string {
  // Check cookie
  const cookie = request.cookies.get("NEXT_LOCALE");
  if (cookie && LOCALES.includes(cookie.value)) return cookie.value;

  // Check Accept-Language
  const acceptLang = request.headers.get("accept-language") || "";
  for (const part of acceptLang.split(",")) {
    const lang = part.split(";")[0].trim();
    // Exact match
    if (LOCALES.includes(lang)) return lang;
    // Prefix match (e.g. "pt" → "pt-BR", "es-MX" → "es")
    const prefix = lang.split("-")[0];
    const match = LOCALES.find(
      (l) => l === prefix || l.startsWith(prefix + "-")
    );
    if (match) return match;
  }

  return DEFAULT_LOCALE;
}

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
  const { pathname, search } = request.nextUrl;

  // Skip API, auth callback, Next.js internals, and static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Detect locale from path
  const pathLocale = getPathLocale(pathname);

  // No locale prefix → redirect to locale-prefixed path
  if (!pathLocale) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
    return response;
  }

  // Extract the path without locale prefix for auth checks
  const rest = pathname.split("/").slice(2).join("/");
  const pathWithoutLocale = rest ? `/${rest}` : "/";

  // Fix double-locale URLs (e.g. /en/fr → /fr, /en/fr/pricing → /fr/pricing)
  const secondSegment = pathWithoutLocale.split("/")[1];
  if (secondSegment && LOCALES.includes(secondSegment)) {
    const url = request.nextUrl.clone();
    url.pathname = pathWithoutLocale;
    return NextResponse.redirect(url);
  }

  // Auth checks
  if (!isSupabaseConfigured()) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", pathLocale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
    });
    return response;
  }

  const { supabase, getResponse } = makeSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in user visiting /login → redirect to dashboard
  if (pathWithoutLocale === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathLocale}/dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Protected route without session → redirect to login
  const isProtected = PROTECTED.some(
    (path) =>
      pathWithoutLocale === path ||
      pathWithoutLocale.startsWith(`${path}/`)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathLocale}/login`;
    url.search = "";
    const returnTo = pathname + search;
    url.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(url);
  }

  const response = getResponse();
  response.cookies.set("NEXT_LOCALE", pathLocale, {
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|auth|_next|.*\\..*).*)"],
};
