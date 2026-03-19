import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Just allow request if user is authenticated
    return NextResponse.next();
  },
  {
    callbacks: {
      // Only check if user is logged in
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};