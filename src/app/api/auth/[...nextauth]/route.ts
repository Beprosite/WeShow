// This file is no longer needed as we're removing Google authentication

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/studio/auth/login',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Store the initial user data
      // You can check if this is their first sign in and handle accordingly
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        // Add any custom session data
        session.user.planType = token.planType as string;
        session.user.billingCycle = token.billingCycle as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account) {
        // Store plan info in the token
        token.planType = (account as any).planType;
        token.billingCycle = (account as any).billingCycle;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST }; 