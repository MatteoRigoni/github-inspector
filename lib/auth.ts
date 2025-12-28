import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createOrUpdateUser } from "./users";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Salva o aggiorna l'utente in Supabase quando fa login
        if (user.id && user.email) {
          await createOrUpdateUser({
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            provider: account?.provider || "google",
            provider_id: account?.providerAccountId || null,
          });
        }
        return true;
      } catch (error) {
        console.error("Error saving user to database:", error);
        // Non bloccare il login se c'è un errore nel salvataggio
        // L'utente può comunque accedere
        return true;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

