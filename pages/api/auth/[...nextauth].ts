import axios from 'axios'
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: '/login',
    signOut: '/logout',
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
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
        try {
          const response = await axios.post('http://192.168.0.12:8000/users/login/', {
            email: credentials?.username, 
            password: credentials?.password
          })
          if (response) {
            // Any object returned will be saved in `user` property of the JWT
            return response.data
          } else {
            // If you return null then an error will be displayed advising the user to check their details.
            return null

            // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
          }
        } catch(e) {
          return null
        }
      }
    }),
  ],
  callbacks: {
    async signIn(response) {
      console.log(response)
      return true
    },
    async session({ token, session }) {
      session.user = token
      return session
    },
    async jwt({ token, user }) {
      console.log(token, user)
      return { ...token, ...user }
    }
  }
}
export default NextAuth(authOptions)
