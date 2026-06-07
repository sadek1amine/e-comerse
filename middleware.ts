import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require user session authentication
const PROTECTED_ROUTES = ['/checkout', '/account', '/orders', '/api/checkout', '/admin'];

// Define paths that should bypass authentication checks
const PUBLIC_AUTH_ROUTES = ['/login', '/signup', '/auth/callback', '/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Initialize Response and cloned Headers to inject Geo-IP context
  const requestHeaders = new Headers(request.headers);
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 2. Parse Geo-IP Country Header and Set Localization Context
  // Typically injected by Edge platforms (Vercel: 'x-vercel-ip-country', Cloudflare: 'cf-ipcountry')
  const geoIpCountry = (
    request.headers.get('x-vercel-ip-country') || 
    request.headers.get('cf-ipcountry') || 
    'SA'
  ).toUpperCase();

  // Support GCC regional localization (KSA & UAE), default to Saudi Arabia (largest GCC market)
  const activeCountry = (geoIpCountry === 'AE' || geoIpCountry === 'SA') ? geoIpCountry : 'SA';
  const activeCurrency = activeCountry === 'SA' ? 'SAR' : 'AED';

  // Inject localization headers for downstream Next.js Server Components
  requestHeaders.set('x-gcc-country', activeCountry);
  requestHeaders.set('x-gcc-currency', activeCurrency);

  // Set localization cookies so client components can read them without flash of unlocalized content
  response.cookies.set('x-localization-country', activeCountry, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    secure: true,
    sameSite: 'lax',
  });
  response.cookies.set('x-localization-currency', activeCurrency, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    secure: true,
    sameSite: 'lax',
  });

  // 3. Supabase Auth Session Management & Token Refreshing (Next.js 15 App Router standard)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // IMPORTANT: Do NOT use auth.getSession() in Middleware. Always use auth.getUser().
  // auth.getUser() validates the access token against Supabase auth server and refreshes the session cookie if expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Implement Route Guard Protection
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    // Redirect unauthenticated user to Login, maintaining target destination in search params
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Enforce Admin Role checking (RBAC) at the edge
  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?error=Unauthorized', request.url));
    }
  }

  if (isAuthRoute && user) {
    // If authenticated user tries to visit login/signup, redirect to account dashboard or home
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return response;
}

// Optimized matcher configuration to exclude static assets, SVGs, images, and Next.js internal files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to add other paths here like images or public files.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
