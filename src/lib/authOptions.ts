import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        let user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        // Backward-compatible fallback for legacy records that may have mixed-case emails.
        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              email: {
                equals: normalizedEmail,
                mode: "insensitive",
              },
            },
          });
        }

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role ?? "user",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
  },
 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.email = user.email;
      token.role = user.role;
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.role = token.role as string;
    }

    return session;
  },
},
};
