import '@/plugins/axios';
import '@/date-fns.config.js';
import '../styles/globals.css';

import axios from 'axios';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import React, { lazy } from 'react';

import { Toaster } from '@/components/ui/toaster';

const Layout = lazy(async () => await import('../components/common/layout/Layout'));

const App = ({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) => {
  if (Component.layout === 'public') {
    return (
      <>
        <Head>
          <title>I spent a Dollar</title>
        </Head>
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>I spent a Dollar</title>
      </Head>
      <SessionProvider session={session}>
        <Toaster />
        {Component.auth ? (
          <Auth>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </Auth>
        ) : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </SessionProvider>
    </>
  );
};

interface AuthProps {
  children: React.ReactNode;
}

function Auth({ children }: AuthProps) {
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  axios.defaults.headers.common.Authorization = `Token ${session.user.token}`;

  return children;
}

export default App;
