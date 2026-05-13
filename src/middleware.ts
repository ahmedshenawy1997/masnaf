import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ONLY_PATHS = [
  '/dashboard/employees',
  '/dashboard/leaves',
  '/dashboard/payroll',
  '/dashboard/reports',
];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Redirect authenticated users away from login/register
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect root to dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Block EMPLOYEE from admin-only pages
    if (token && token.role === 'EMPLOYEE') {
      const isAdminPath = ADMIN_ONLY_PATHS.some(p => pathname.startsWith(p));
      if (isAdminPath) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public paths — always allowed
        if (pathname === '/login' || pathname === '/register') return true;
        // Everything else requires auth
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/', '/login', '/register'],
};
