import '../styles/globals.css'
import React, { lazy } from 'react'
import type { AppProps } from 'next/app'
import typography from '../theme/typography'
import { Toolbar } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider } from '@/context/auth';
import '@/plugins/axios'
import axios from 'axios'
import { Toaster } from '@/components/ui/toaster'

import { get } from '@/models/indexedDb.config'

const Layout = lazy(async () => await import('../components/common/layout/Layout'))

const App = ({ Component, pageProps }: AppProps) => {
  const [loading, setLoading] = React.useState<boolean>(true)
  const [token, setToken] = React.useState<string>('')
  const themeOptions = {
    typography
  }

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }

  React.useEffect(() => {
    const loadUserFromIndexedDB = async (): Promise<void> => {
      const storedUser = await get(0)

      if (storedUser) {
        setToken(storedUser.token)
      }
      setLoading(false)
    }
    loadUserFromIndexedDB()
  }, [])

  const theme = createTheme({ ...themeOptions })

  if (loading) {
    return
  }

  if (Component.layout === 'public') {
    return (
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Toaster />
      <AuthProvider>
        <Layout>
          <Toolbar />
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
