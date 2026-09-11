import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    currency: string;
    username: string;
    token: string;
  }

  interface Session {
    user: {
      currency: string;
      username: string;
      token: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    currency: string;
    username: string;
    token: string;
  }
}
