import { FC } from 'react'
import withBudgetTemplate from '@/components/budget/hoc'
import Container from '@/components/budget/components/week/Container'

const WeekTemplate = withBudgetTemplate(Container)

const Index: FC = () => {
  return (
    <WeekTemplate activeType="week" />
  )
}

export default Index
