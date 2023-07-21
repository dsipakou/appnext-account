import { SessionProvider, useSession } from "next-auth/react"
import type { Session } from "next-auth"
import React, { lazy } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import typography from '../theme/typography'
import { Toolbar } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider } from '@/context/auth';
import '@/plugins/axios'
import axios from 'axios'
import { Toaster } from '@/components/ui/toaster'
import '@/date-fns.config.js'
import '../styles/globals.css'

import { get } from '@/models/indexedDb.config'

const Layout = lazy(async () => await import('../components/common/layout/Layout'))

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [token, setToken] = React.useState<string>('')
  const themeOptions = {
    typography
  }

  // if (token) {
  //   axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  // }

  React.useEffect(() => {
    const loadUserFromIndexedDB = async (): Promise<void> => {
      const storedUser = await get(0)

      if (storedUser) {
        setToken(storedUser.token)
      }
      setLoading(false)
    }
    loadUserFromIndexedDB() }, [])

  const theme = createTheme({ ...themeOptions })

  if (loading) {
    return
  }

  if (Component.layout === 'public') {
    return (
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Component {...pageProps} />
          </AuthProvider>
        </ThemeProvider>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <Toaster />
        <AuthProvider>
          {Component.auth ? (
            <Auth>
              <Layout>
                <Toolbar />
                <Component {...pageProps} />
              </Layout>
            </Auth>
          ) : (
            <Layout>
              <Toolbar />
              <Component {...pageProps} />
            </Layout>
          )}
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

type AuthProps = {
  children: React.ReactNode
}

function Auth({ children }: AuthProps) {
  const router = useRouter()

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login')
    }
  })

  if (status === "loading") {
    return
  }

  axios.defaults.headers.common['Authorization'] = `Token ${session.user.token}`;

  return children
}

export default App
