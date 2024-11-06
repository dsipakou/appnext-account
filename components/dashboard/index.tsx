import WeekWidget from '@/components/dashboard/components/WeekWidget'
import RecentTransactions from '@/components/dashboard/components/RecentTransactions'
import UpcommingExpenses from '@/components/dashboard/components/UpcommingExpenses'

const Index = () => {
  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">Your dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WeekWidget />
        <RecentTransactions />
        <UpcommingExpenses />
      </div>
    </div>
  )
}

export default Index
