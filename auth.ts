import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

// so typescript knows access_token exists on the session object
declare module "next-auth" {
  interface Session {
    access_token: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    // NextAuth doesn't expose the GitHub access token by default — store it in the JWT on sign-in
    jwt({ token, account }) {
      if (account) token.access_token = account.access_token as string
      return token
    },
    // Surface the token from the JWT onto the session so API routes can use it for GitHub API calls
    session({ session, token }) {
      session.access_token = token.access_token as string
      return session
    },
  },
})