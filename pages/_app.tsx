import { SessionProvider, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import React, { lazy } from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import typography from '../theme/typography'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import '@/plugins/axios'
import axios from 'axios'
import { Toaster } from '@/components/ui/toaster'
import '@/date-fns.config.js'
import '../styles/globals.css'

const Layout = lazy(async () => await import('../components/common/layout/Layout'))

const App = ({
  Component,
  pageProps: { session, ...pageProps }
}: AppProps<{ session: Session }>) => {
  const themeOptions = { typography }

  const theme = createTheme({ ...themeOptions })

  if (Component.layout === 'public') {
    return (
      <>
        <Head>
          <title>I spent a Dollar</title>
        </Head>
        <SessionProvider session={session}>
          <ThemeProvider theme={theme}>
            <Component {...pageProps} />
          </ThemeProvider>
        </SessionProvider>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>I spent a Dollar</title>
      </Head>
      <SessionProvider session={session}>
        <ThemeProvider theme={theme}>
          <Toaster />
          {Component.auth
            ? (
              <Auth>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </Auth>
            )
            : (
              <Layout>
                <Component {...pageProps} />
              </Layout>
            )}
        </ThemeProvider>
      </SessionProvider>
    </>
  )
}

interface AuthProps {
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

  if (status === 'loading') {
    return
  }

  axios.defaults.headers.common.Authorization = `Token ${session.user.token}`

  return children
}

export default App
