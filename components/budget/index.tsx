import { SelectChangeEvent, useEffect, useState } from 'react'
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Toolbar,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { useUsers } from '@/hooks/users'
import { useAuth } from '@/context/auth'
import { useBudgetMonth } from '@/hooks/budget'
import { User } from '@/components/users/types'
import { 
  getStartOfMonth,
  getEndOfMonth,
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'
import { GeneralSummaryCard } from './components'
import WeekCalendar from '@/components/budget/components/week/WeekCalendar'
import MonthCalendar from '@/components/budget/components/month/MonthCalendar'
import { default as MonthContainer } from './components/month/Container'
import { default as WeekContainer } from './components/week/Container'
import {
  MonthGroupedBudgetItem,
  GroupedByCategoryBudget
} from './types'

type BudgetType = 'month' | 'week'

const Index = () => {
  const { user: userConfig } = useAuth();
  const [budgetForMonth, setBudgetForMonth] = useState<GroupedByCategoryBudget[]>([])
  const [user, setUser] = useState<string>('all')
  const [monthDate, setMonthDate] = useState<Date>(new Date())
  const [weekDate, setWeekDate] = useState<Date>(new Date())
  const [startOfMonth, setStartOfMonth] = useState<string>(getStartOfMonth(monthDate))
  const [startOfWeek, setStartOfWeek] = useState<string>(getStartOfWeek(weekDate))
  const [endOfMonth, setEndOfMonth] = useState<string>(getEndOfMonth(monthDate))
  const [endOfWeek, setEndOfWeek] = useState<string>(getEndOfWeek(weekDate))
  const [activeType, setActiveType] = useState<BudgetType>('month')
  const [activeCategory, setActiveCategory] = useState<string>()
  const {
    data: users,
    isLoading: isUsersLoading,
  } = useUsers();
  const {
    data: budgetMonth,
    isLoading: isMonthBudgetLoading
  } = useBudgetMonth(startOfMonth, endOfMonth);

  useEffect(() => {
    setStartOfMonth(getStartOfMonth(monthDate))
    setEndOfMonth(getEndOfMonth(monthDate))
  }, [monthDate])

  useEffect(() => {
    setStartOfWeek(getStartOfWeek(weekDate))
    setEndOfWeek(getEndOfWeek(weekDate))
  }, [weekDate])

  useEffect(() => {
    console.log(activeCategory);
  }, [activeCategory]);

  const plannedSum: number = budgetMonth?.reduce(
    (acc: number, item: MonthGroupedBudgetItem) => acc + item.plannedInCurrencies[userConfig?.currency] || 0, 0
  )

  const spentSum: number = budgetMonth?.reduce(
    (acc: number, item: MonthGroupedBudgetItem) => acc + item.spentInCurrencies[userConfig?.currency] || 0, 0
  )

  const changeUser = (e: SelectChangeEvent): void => {
    setUser(e.target.value);
  }

  const toolbar = (
    <Toolbar sx={{ pb: 1 }}>
      <Typography variant="h4" sx={{ my: 2 }}>Budget</Typography>
      <Box sx={{ flexGrow: 1 }} />
      <ButtonGroup
        disableElevation
        size="large"
        aria-label="outlined primary button group"
        sx={{ backgroundColor: "info.dark" }}
      >
        <Button
          disabled={activeType === 'month'}
          variant={activeType === 'month' ? "text" : "contained"}
          onClick={() => setActiveType('month')}
          sx={{ width: 180, p: 0, backgroundColor: "info.dark" }}
        >
          <Typography
            variant="h5"
            sx={activeType === "month" ? {
              display: 'flex',
              justifyContent: 'center',
              color: "info.dark",
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Monthly
          </Typography>
        </Button>
        <Button
          disabled={activeType === 'week'}
          color="info"
          variant={activeType === 'week' ? "text" : "contained"}
          onClick={() => setActiveType('week')}
          sx={{ width: 180, p: 0, backgroundColor: "info.dark" }}
        >
          <Typography
            variant="h5"
            sx={activeType === "week" ? {
              display: 'flex',
              justifyContent: 'center',
              color: 'info.dark',
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Weekly
          </Typography>
        </Button>
      </ButtonGroup>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        sx={{ textTransform: 'none' }}
        onClick={() => { }}
      >
        Add budget
      </Button>
    </Toolbar>
  )

  const header = (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={4}>
        <GeneralSummaryCard planned={plannedSum} spent={spentSum} />
      </Grid>
      <Grid item xs={2}>
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth>
          <InputLabel id="user-select-label">User</InputLabel>
          <Select
            labelId="user-select-label"
            label="Type"
            fullWidth
            value={user}
            onChange={changeUser}
          >
            <MenuItem value="all">All</MenuItem>
            {!isUsersLoading && users.map((item: User) => (
              <MenuItem value={item.uuid} key={item.uuid}>{item.username}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={3}>
        {activeType === "month" ?
          <MonthCalendar date={monthDate} setMonthDate={setMonthDate} /> :
          <WeekCalendar date={weekDate} setWeekDate={setWeekDate} />
        }
      </Grid>
    </Grid>
  );

  return (
    <>
      {toolbar}
      {(isMonthBudgetLoading) && (
        <Box sx={{ position: 'relative', width: '100%' }}>
          <LinearProgress color="primary" sx={{
            position: 'absolute',
            width: '100%',
            top: -5,
            left: 0,
            zIndex: 2
          }} />
        </Box>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {header}
        </Grid>
        <Grid item xs={12}>
          {
            activeType === 'month'
              ? <MonthContainer startDate={startOfMonth} endDate={endOfMonth} />
              : <WeekContainer startDate={startOfWeek} endDate={endOfWeek} />
          }
        </Grid>
      </Grid>
    </>
  )
}

export default Index;
