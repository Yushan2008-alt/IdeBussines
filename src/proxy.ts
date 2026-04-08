/**
 * RuangTeduh — Next.js 16 Proxy (formerly Middleware)
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session cookie on every request
 *    (required by @supabase/ssr so tokens don't expire mid-session).
 * 2. Protect private routes — redirect unauthenticated users to /login.
 * 3. Redirect already-authenticated users away from /login and /register.
 *
 * Note: Next.js 16 renames "middleware" to "proxy".
 * The function must be exported as `proxy` (named export).
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/* Routes that require a valid session ──────────────── */
const PROTECTED_ROUTES = ["/dashboard", "/profil"];

/* Routes that logged-in users should be bounced from ─ */
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  // Skip if Supabase env vars aren't configured yet
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT run any Supabase queries between createServerClient()
  // and getUser(). Doing so could cause the session to be out of sync.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Unauthenticated user hitting a protected route → /login
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user hitting auth routes → /dashboard
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public assets (png, jpg, svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
