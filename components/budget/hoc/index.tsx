import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
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
import { useBudgetMonth, useBudgetWeek } from '@/hooks/budget'
import { User } from '@/components/users/types'
import { 
  getStartOfMonth,
  getEndOfMonth,
  getStartOfWeek,
  getEndOfWeek
} from '@/utils/dateUtils'
import { GeneralSummaryCard } from '@/components/budget/components'
import WeekCalendar from '@/components/budget/components/week/WeekCalendar'
import MonthCalendar from '@/components/budget/components/month/MonthCalendar'
import {
  PlannedMap,
  SpentMap
} from '@/components/budget/types'
import {
  AddForm,
  EditForm,
  ConfirmDeleteForm
} from '@/components/budget/forms'

type BudgetType = 'month' | 'week'

function withBudgetTemplate<T>(Component: React.ComponentType<T>) {
  return (hocProps: Omit<T, "activeType">) => {
    const activeType = hocProps.activeType || 'month'
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const { user: userConfig } = useAuth();
    const [user, setUser] = useState<string>('all')
    const [monthDate, setMonthDate] = useState<Date>(new Date())
    const [weekDate, setWeekDate] = useState<Date>(new Date())
    const [startOfMonth, setStartOfMonth] = useState<string>(getStartOfMonth(monthDate))
    const [startOfWeek, setStartOfWeek] = useState<string>(getStartOfWeek(weekDate))
    const [endOfMonth, setEndOfMonth] = useState<string>(getEndOfMonth(monthDate))
    const [endOfWeek, setEndOfWeek] = useState<string>(getEndOfWeek(weekDate))
    const [plannedSum, setPlannedSum] = useState<number>(0)
    const [spentSum, setSpentSum] = useState<number>(0)
    const [isOpenAddBudget, setIsOpenAddBudget] = useState<boolean>(false)
    const [isOpenEditForm, setIsOpenEditForm] = useState<boolean>(false)
    const [isOpenConfirmDeleteForm, setIsOpenConfirmDeleteForm] = useState<boolean>(false)
    const [activeBudgetUuid, setActiveBudgetUuid] = useState<string>('')
    const startDate = activeType === 'month' ? startOfMonth : startOfWeek
    const endDate = activeType === 'month' ? endOfMonth : endOfWeek
    
    const {
      data: users,
      isLoading: isUsersLoading,
    } = useUsers();

    const {
      data: budgetMonth,
      isLoading: isMonthBudgetLoading,
      url: monthUrl
    } = useBudgetMonth(startOfMonth, endOfMonth);

    const {
      data: budgetWeek,
      isLoading: isWeekBudgetLoading,
      url: weekUrl
    } = useBudgetWeek(startOfWeek, endOfWeek)

    const handleClickDelete = (uuid: string): void => {
      setActiveBudgetUuid(uuid)
      setIsOpenConfirmDeleteForm(true)
    }

    const handleClickEdit = (uuid: string): void => {
      setActiveBudgetUuid(uuid)
      setIsOpenEditForm(true)
    }

    useEffect(() => {
      setStartOfMonth(getStartOfMonth(monthDate))
      setEndOfMonth(getEndOfMonth(monthDate))
    }, [monthDate])

    useEffect(() => {
      setStartOfWeek(getStartOfWeek(weekDate))
      setEndOfWeek(getEndOfWeek(weekDate))
    }, [weekDate])

    useEffect(() => {
      let _planned = 0
      let _spent = 0
      if (activeType === 'month') {
        if (isMonthBudgetLoading) return

        _planned = budgetMonth.reduce(
          (acc: number, { plannedInCurrencies }: PlannedMap) => {
            return acc + plannedInCurrencies[userConfig.currency]
          }, 0
        )
        _spent = budgetMonth.reduce(
          (acc: number, { spentInCurrencies }: SpentMap) => {
            return acc + (spentInCurrencies[userConfig.currency] || 0)
          }, 0
        )
      } else {
        if (isWeekBudgetLoading) return

        _planned = budgetWeek.reduce(
          (acc: number, { plannedInCurrencies }: PlannedMap) => {
            return acc + plannedInCurrencies[userConfig.currency]
          }, 0
        )
        _spent = budgetWeek.reduce(
          (acc: number, { spentInCurrencies }: SpentMap) => {
            return acc + (spentInCurrencies[userConfig.currency] || 0)
          }, 0
        )
      }
      setPlannedSum(_planned)
      setSpentSum(_spent)
    }, [isMonthBudgetLoading, isWeekBudgetLoading, budgetMonth, budgetWeek])

    const handleTypeButtonClick = (type: BudgetType) => {
      router.push(`/budget/${type}`)
    }

    const changeUser = (e: SelectChangeEvent): void => {
      setUser(e.target.value);
    }

    const handleCloseModal = () => {
      setIsOpenAddBudget(false)
      setIsOpenConfirmDeleteForm(false)
      setIsOpenEditForm(false)
    }

    const mutateBudget = (): void => {
      mutate(weekUrl)
      mutate(monthUrl)
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
            onClick={() => handleTypeButtonClick('month')}
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
            onClick={() => handleTypeButtonClick('week')}
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
          onClick={() => setIsOpenAddBudget(true)}
        >
          Add budget
        </Button>
      </Toolbar>
    )

    const header = (
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={4}>
          <GeneralSummaryCard planned={plannedSum} spent={spentSum} title={activeType} />
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
            <Component
              startDate={startDate}
              endDate={endDate}
              clickEdit={handleClickEdit}
              clickDelete={handleClickDelete}
              mutateBudget={mutateBudget}
            />
          </Grid>
        </Grid>
        <AddForm
          open={isOpenAddBudget}
          handleClose={handleCloseModal}
          monthUrl={monthUrl}
          weekUrl={weekUrl}
        />
        {activeBudgetUuid && (
          <>
            <ConfirmDeleteForm
              open={isOpenConfirmDeleteForm}
              uuid={activeBudgetUuid}
              handleClose={handleCloseModal}
              monthUrl={monthUrl}
              weekUrl={weekUrl}
            />
            <EditForm
              open={isOpenEditForm}
              uuid={activeBudgetUuid}
              handleClose={handleCloseModal}
              monthUrl={monthUrl}
              weekUrl={weekUrl}
            />
          </>
        )
      }
      </>
    )
  }
}

export default withBudgetTemplate;
