import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      currency: string
      username: string
      token: string
    }
  } & DefaultSession["user"]
}

