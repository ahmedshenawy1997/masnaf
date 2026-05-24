import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        const user = await prisma.user.findUnique({
          where: { username: credentials.username }
        });
        
        if (!user) {
          throw new Error("Invalid username or password");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isValid) {
          throw new Error("Invalid username or password");
        }

        return {
          id: user.id,
          name: user.username,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET || 'masnaf-prod-secret-xK9mP2qR7nL4',
};
