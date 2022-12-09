import { FC } from 'react'
import withBudgetTemplate from '@/components/budget/hoc'
import Container from '@/components/budget/components/month/Container'

const MonthTemplate = withBudgetTemplate(Container)

const Index: FC = () => {
  return (
    <MonthTemplate activeType="month" />
  )
}

export default Index
