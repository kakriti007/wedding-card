import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Hardcoded admin credentials
const ADMIN_USERS = [
  "tinagthodety@gmail.com",
  "kakriti007@gmail.com",
  "apurv.karpatne@gmail.com",
  "ck250894@gmail.com",
];

const SECURITY_ANSWERS = {
  country: "INDIA",
  food: "Biryani@001",
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        country: { label: "Where do you live?", type: "text" },
        food: { label: "What is your favourite food?", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.country || !credentials?.food) {
          return null;
        }

        // Check if email is in admin list
        if (!ADMIN_USERS.includes(credentials.email.toLowerCase().trim())) {
          return null;
        }

        // Validate security questions
        if (
          credentials.country !== SECURITY_ANSWERS.country ||
          credentials.food !== SECURITY_ANSWERS.food
        ) {
          return null;
        }

        // Get or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              isAdmin: true,
            },
          });
        } else if (!user.isAdmin) {
          user = await prisma.user.update({
            where: { email: credentials.email },
            data: { isAdmin: true },
          });
        }

        return {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
};
