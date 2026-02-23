import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      const allowedEmails = [
        "developer@insurbe.com",
        "admin@insurbe.com",
      ];

      return !!token && allowedEmails.includes(token.email as string);
    },
  },
});

export const config = {
  matcher: ["/insuranceSignupFlow/:path*"],
};