/* eslint-disable import/no-unassigned-import */
import "@/plugins/axios";
import "@/date-fns.config.js";
import "../styles/globals.css";
import type { Session } from "next-auth";
import type { AppProps } from "next/app";

import axios from "axios";
import { SessionProvider, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { lazy } from "react";

import { AnchoredToastProvider, ToastProvider } from "@/components/ui/toast";

const Layout = lazy(async () => import("../components/common/layout/Layout"));

type AppPropsWithAuth = AppProps<{ session: Session }> & {
  Component: AppProps["Component"] & {
    auth?: Record<string, never>;
    layout?: "public";
  };
};

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithAuth): React.ReactElement => {
  if (Component.layout === "public") {
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
        {Component.auth ? (
          <Auth>
            <Layout>
              <ToastProvider>
                <AnchoredToastProvider>
                  <Component {...pageProps} />
                </AnchoredToastProvider>
              </ToastProvider>
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

type AuthProps = {
  children: React.ReactElement;
};

function Auth({ children }: AuthProps): React.ReactElement {
  const router = useRouter();
  const [isAuthHeaderReady, setIsAuthHeaderReady] = React.useState(false);

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.push("/login");
    },
  });

  React.useEffect(() => {
    if (!session?.user.token) {
      delete axios.defaults.headers.common.Authorization;
      setIsAuthHeaderReady(false);
      return;
    }

    axios.defaults.headers.common.Authorization = `Token ${session.user.token}`;
    setIsAuthHeaderReady(true);
  }, [session?.user.token]);

  if (status === "loading" || !isAuthHeaderReady) {
    return <div>Loading...</div>;
  }

  return children;
}

export default App;
