import '../styles/globals.css'
import { lazy } from 'react';
import type { AppProps } from 'next/app'
import { store } from '../app/store';
import { Provider } from 'react-redux';

const Layout = lazy(() => import('../components/common/Layout'));

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <Provider store={store}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  )
}

export default App;
