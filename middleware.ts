import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    const allowedEmails = ["developer@insurbe.com", "admin@insurbe.com"];

    if (token && !allowedEmails.includes(token.email as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/insuranceSignupFlow/:path*",
    "/calculator/submitApplication/:path*",
    "/ottonovaSignupform/:path*",
  ],
};
