import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

declare module "next-auth" {
  interface Session {
    access_token: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, account }) {
      if (account) token.access_token = account.access_token as string
      return token
    },
    session({ session, token }) {
      session.access_token = token.access_token as string
      return session
    },
  },
})