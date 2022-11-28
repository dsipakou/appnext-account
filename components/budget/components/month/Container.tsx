import { FC, useState } from 'react'
import { useBudgetMonth } from '@/hooks/budget'
import {
  Grid,
  Stack
} from '@mui/material'
import { GroupedByCategoryBudget } from '@/components/budget/types'
import CategorySummaryButton from './CategorySummaryButton'
import DetailsPanel from './DetailsPanel'

const Container: FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('')
  const {
    data: budget,
    isLoading: isBudgetLoading
  } = useBudgetMonth("2022-11-01", "2022-11-30");

  return (
    <Grid container>
      <Grid item xs={4}>
        <Stack spacing={2}>
          {!isBudgetLoading && budget.map((item: GroupedByCategoryBudget) => (
            <CategorySummaryButton
              key={item.uuid}
              title={item.categoryName}
              onClick={() => setActiveCategory(item.uuid)}
              activeCategory={activeCategory}
            />
          ))}
        </Stack>
      </Grid>
      <Grid item xs={8}>
        <DetailsPanel />
      </Grid>
    </Grid>
  )
}

export default Container
