import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async signIn({ user }) {
            const rawEmails = process.env.ALLOWED_EMAILS || "";
            // Remove quotes if they exist and split by comma
            const allowedEmails = rawEmails.replace(/['"]/g, "").split(",").map(e => e.trim().toLowerCase()).filter(e => e !== "");

            const userEmail = user.email?.toLowerCase();
            const isAllowed = userEmail ? allowedEmails.includes(userEmail) : false;

            return isAllowed;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};
