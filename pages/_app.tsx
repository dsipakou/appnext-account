import '../styles/globals.css'
import { lazy } from 'react'
import type { AppProps } from 'next/app'
import typography from '../theme/typography'
import { Toolbar } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider } from '@/context/auth';
import '@/plugins/axios'

const Layout = lazy(async () => await import('../components/common/layout/Layout'))

const App = ({ Component, pageProps }: AppProps) => {
  const themeOptions = {
    typography
  }

  const theme = createTheme({ ...themeOptions })

  if (Component.layout === 'public') {
    return (
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
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
