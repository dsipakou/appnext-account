import axios from 'axios'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  // Configure one or more authentication providers
  pages: {
    signIn: '/login',
    signOut: '/logout'
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      id: 'credentials',
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize (credentials) {
        // Add logic here to look up the user from the credentials supplied
        try {
          let url
          if (process.env.NEXT_PUBLIC_ENV_TYPE === 'prod') {
            url = `${process.env.NEXT_PUBLIC_API_SCHEMA}://${process.env.NEXT_PUBLIC_API_HOST}/users/login/`
          } else {
            url = `${process.env.NEXT_PUBLIC_API_SCHEMA}://${process.env.NEXT_PUBLIC_API_HOST}:${process.env.NEXT_PUBLIC_API_PORT}/users/login/`
          }
          console.log(url)
          const response = await axios.post(url, {
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
        } catch (e) {
          console.log('after')
          console.log(e)
          return null
        }
      }
    })
  ],
  callbacks: {
    async session ({ token, session }) {
      session.user = token
      return session
    },
    async jwt ({ token, trigger, user, session }) {
      if (trigger === 'update' && session?.currency) {
        token.currency = session.currency
      }
      return { ...token, ...user }
    }
  }
}
export default NextAuth(authOptions)
