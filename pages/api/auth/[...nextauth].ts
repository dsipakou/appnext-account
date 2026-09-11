import axios from "axios";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type LoginResponse = {
  currency: string;
  token: string;
  username: string;
};

type LoginUser = LoginResponse & {
  id: string;
};

const getApiUrl = (path: string) => {
  const schema = process.env.API_SCHEMA ?? process.env.NEXT_PUBLIC_API_SCHEMA;
  const host = process.env.API_HOST ?? process.env.NEXT_PUBLIC_API_HOST;
  const port = process.env.API_PORT ?? process.env.NEXT_PUBLIC_API_PORT;
  const isProd = process.env.ENV_TYPE === "prod" || process.env.NEXT_PUBLIC_ENV_TYPE === "prod";

  if (!schema || !host) {
    throw new Error("API_SCHEMA/API_HOST env variables are required");
  }

  const baseUrl = isProd || !port ? `${schema}://${host}` : `${schema}://${host}:${port}`;

  return `${baseUrl}${path}`;
};

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      id: "credentials",
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        try {
          const response = await axios.post<LoginResponse>(getApiUrl("/users/login/"), {
            email: credentials?.username,
            password: credentials?.password,
          });

          // Any object returned will be saved in `user` property of the JWT.
          return response ? ({ ...response.data, id: response.data.username } satisfies LoginUser) : null;
        } catch {
          // Returning null shows a credentials error without leaking backend details.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      session.user = {
        ...session.user,
        currency: token.currency,
        token: token.token,
        username: token.username,
      };

      return session;
    },
    jwt({ token, trigger, user, session }) {
      if (user) {
        token.currency = user.currency;
        token.token = user.token;
        token.username = user.username;
      }

      const updatedSession = session as { currency?: unknown } | undefined;

      if (trigger === "update" && typeof updatedSession?.currency === "string") {
        token.currency = updatedSession.currency;
      }

      return token;
    },
  },
};
export default NextAuth(authOptions);
