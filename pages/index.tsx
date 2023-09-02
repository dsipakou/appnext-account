import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

Home.auth = {}

export default function Home () {
  return (
    <div className="flex flex-1 justify-center items-center">
      <Head>
        <title>Flying Budget</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className="flex flex-col flex-1 justify-center items-center">
        <h1 className={styles.title}>
          Welcome to Flying Budget
        </h1>

        <p className={styles.description}>
          Dashboard page is under construction
        </p>

      </main>
    </div>
  )
}
