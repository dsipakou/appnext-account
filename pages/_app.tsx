import '../styles/globals.css'
import { lazy } from 'react'
import type { AppProps } from 'next/app'
import { store } from '../app/store'
import typography from '../theme/typography'
import { CssBaseline, Toolbar } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { AuthProvider, useAuth } from '@/context/auth';
import '@/plugins/axios'

const Layout = lazy(async () => await import('../components/common/layout/Layout'))

const App = ({ Component, pageProps }: AppProps) => {
  const themeOptions = {
    typography
  }

  const theme = createTheme({ ...themeOptions })

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <CssBaseline />
        <Layout>
          <Toolbar />
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
