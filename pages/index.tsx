import Index from '@/components/dashboard'

Home.auth = {}

export default function Home () {
  return (
    <main className="grid grid-cols-4 gap-3">
      <Index />
    </main>
  )
}
