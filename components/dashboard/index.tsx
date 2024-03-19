import WeekWidget from '@/components/dashboard/components/WeekWidget'
import MonthWidget from '@/components/dashboard/components/MonthWidget'
import TopCategories from '@/components/dashboard/components/TopCategories'

const Index = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <WeekWidget />
      <MonthWidget />
    </div>
  )
}

export default Index
