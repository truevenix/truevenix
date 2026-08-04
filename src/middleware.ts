// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Your routes from route.ts (copied here to avoid imports)
const publicRoutes = [
  "/",
  "/auth/email-verification",
  "/about-us",
  "/contact-us",
  "/services",
  "/privacy-policy",
  "/payment-success",
  "/terms-and-conditions",
  "/return-policy",
  "/checkout",
  "/orders",
  "/order/[referenceId]",
  "/track",
  "/api/vpay",
  "/brands",
  "/brands/[brand]",
  "/category",
  "/category/[/category]",
  "/cart",
  "/search",
  "/wishlist",
  "/api/search",
  "/api/vpay/webhook",
  "/api/internal/notify",
  "/api/paystack-callback", 
  "/api/paystack/initialize",
  "/api/paystack/webhook", 
  "/product/[id]",
  "/food/[id]",
  "/room/[id]",
  "/shop",
  "/api/flutterwave/webhook",

  "/api/products/getFeaturedProducts",
  "/api/products/getProducts",
  "/api/products/getProduct",
  "/api/addresses",
  "/api/addresses/[id]",
   "/api/mobile-auth/login",
    "/api/mobile-auth/register",
    "/api/mobile-auth/verify",
    "/api/mobile-auth/reset",
    "/api/mobile-auth/me",
    "/api/promo/validate",
    "/api/rooms",
  "/api/v1/[[...route]]",
  "/api/ai/ask",
  "/sitemap",
  "/sitemap.xml",
  "/products.xml",
  "/robots",
  "/robots.txt",
];

const authRoutes = [
  "/auth/login",
  "/auth/register", 
  "/auth/error",
  "/auth/reset",
  "/auth/new-password"
];

const publicApiPrefixes = [
  "/api/products",
  "/api/v1",
  "/api/orders",
  "/api/mobile-auth",
  "/api/addresses",
  "/api/addresses/[id]",
  "/api/user/phone",
  "/api/ai/ask",
];

const apiAuthPrefix = "/api/auth";
const webhookRoutes = [
  "/api/vpay/webhook",
  "/api/flutterwave/webhook",
  "/api/paystack/webhook",
   "/api/verify-payment",
  "/api/paystack-callback"
];
const DEFAULT_LOGIN_REDIRECT = "/";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
const hostname = request.headers.get('host') || '';
  // ── Subdomain tab routing ──────────────────────────────────────────────
  if (hostname.startsWith('royaloyokitchen.')) {
    const url = nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('tab', 'restaurant');
    return NextResponse.rewrite(url);   // rewrite (not redirect) keeps the subdomain in the address bar
  }

  const pathname = nextUrl.pathname;

  const isPublicApi = publicApiPrefixes.some(prefix =>
  pathname.startsWith(prefix)
);

if (isPublicApi) {
  return NextResponse.next();
}

  // 🚨 CRITICAL: Allow webhook routes without authentication
  const isWebhookRoute = webhookRoutes.some(route => pathname.startsWith(route));
  if (isWebhookRoute) {
    return NextResponse.next();
  }

  

  // Check if user is logged in - NextAuth v5 cookie names
  const isLoggedIn = request.cookies.has('authjs.session-token') || 
                    request.cookies.has('__Secure-authjs.session-token') ||
                    // Fallback for older names (remove these after testing)
                    request.cookies.has('next-auth.session-token') || 
                    request.cookies.has('__Secure-next-auth.session-token');

  // API auth routes - allow through
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }



  // Auth routes (login, register, etc.)
  const isAuthRoute = authRoutes.includes(pathname);
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // Public routes - allow through
 const isPublicRoute = publicRoutes.some(route => {
  if (route.includes('[')) {
    const regex = new RegExp(`^${route.replace(/\[[^\]]+\]/g, '[^/]+')}$`);
    return regex.test(pathname);
  }
  return route === pathname;
});

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    
    return NextResponse.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
