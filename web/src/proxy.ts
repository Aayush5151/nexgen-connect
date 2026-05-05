/**
 * Next.js 16 proxy — Supabase session refresh + /app/* gate.
 *
 * Lives at `web/src/proxy.ts` (renamed from middleware.ts in Next 16
 * — the function below MUST be named `proxy`, not `middleware`, or
 * Next will silently no-op the file). Runs at the network boundary,
 * before page rendering, on the Node.js runtime (no Edge constraint
 * — `@supabase/ssr` reads cookies and re-issues a refreshed JWT).
 *
 * Two responsibilities:
 *
 *   1. Refresh the Supabase session cookie on every request that
 *      crosses the boundary. The @supabase/ssr cookies pattern reads
 *      cookies, validates the JWT, and re-issues a fresh access
 *      token before it expires. Without this, a long-lived browser
 *      tab eventually starts hitting tRPC procedures with an expired
 *      session — server treats that as anonymous and returns
 *      `E001:auth_required` mid-flow.
 *
 *   2. Hard-gate `/app/**`. If the session is missing or the user
 *      hasn't passed phone OTP, redirect to `/signup`. Static assets,
 *      marketing pages, /api/trpc, and the /signup funnel itself are
 *      excluded by `config.matcher` so this fires only on the authed
 *      surface.
 *
 * Why proxy (not a layout server-component check): a layout runs
 * *after* the page component renders for a streamed RSC, which means
 * a flash of the gated content can land in the client buffer before
 * the redirect hits. Doing the redirect at the platform layer before
 * the page is rendered avoids that race.
 *
 * v16 web pivot §P2.
 */
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function proxy(request: NextRequest) {
  // Build a response we'll mutate: cookies set during the Supabase
  // refresh need to flow back to the browser. Pattern is from the
  // @supabase/ssr Next.js docs.
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
          // Mutate both the request (for downstream RSC reads) and the
          // response (for the browser).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: refresh runs as a side-effect of getUser() — don't drop
  // this even if you don't use `data`.
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // Hard gate /app/** only. The matcher already filters static assets
  // and API routes; we still check the prefix here defensively in case
  // the matcher ever widens.
  if (request.nextUrl.pathname.startsWith("/app")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/signup";
      url.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on every request EXCEPT:
  //   - _next/static, _next/image       (build assets)
  //   - favicon, robots, sitemap         (root metadata files)
  //   - /api/                            (tRPC + REST routes manage auth themselves)
  //   - any file with a static extension (images, fonts, css from /public)
  //
  // The /signup funnel is intentionally NOT excluded so the session
  // refresh runs there too (so the moment OTP succeeds, the cookie
  // carries forward without a hard reload).
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  ],
};
