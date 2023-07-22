import * as React from 'react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useSWRConfig } from 'swr'
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Box,
  Button,
  ButtonGroup,
  LinearProgress,
  Toolbar,
  Typography
} from '@mui/material'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import { useUsers } from '@/hooks/users'
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
  DuplicateForm,
  TransactionsForm
} from '@/components/budget/forms'

type BudgetType = 'month' | 'week'

function withBudgetTemplate<T>(Component: React.ComponentType<T>) {
  return (hocProps: Omit<T, "activeType">) => {
    const activeType = hocProps.activeType || 'month'
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const { data: { user: userConfig }} = useSession()
    const [user, setUser] = useState<string>('all')
    const [monthDate, setMonthDate] = useState<Date>(new Date())
    const [weekDate, setWeekDate] = useState<Date>(new Date())
    const [startOfMonth, setStartOfMonth] = useState<string>(getStartOfMonth(monthDate))
    const [startOfWeek, setStartOfWeek] = useState<string>(getStartOfWeek(weekDate))
    const [endOfMonth, setEndOfMonth] = useState<string>(getEndOfMonth(monthDate))
    const [endOfWeek, setEndOfWeek] = useState<string>(getEndOfWeek(weekDate))
    const [plannedSum, setPlannedSum] = useState<number>(0)
    const [spentSum, setSpentSum] = useState<number>(0)
    const [isOpenTransactionsForm, setIsOpenTransactionsForm] = useState<boolean>(false)
    const [isOpenDuplicateForm, setIsOpenDuplicateForm] = useState<boolean>(false)
    const [activeBudgetUuid, setActiveBudgetUuid] = useState<string>('')
    const startDate = activeType === 'month' ? startOfMonth : startOfWeek
    const endDate = activeType === 'month' ? endOfMonth : endOfWeek

    const { data: users } = useUsers();

    const { data: budgetMonth, url: monthUrl } = useBudgetMonth(startOfMonth, endOfMonth, user)
    const { data: budgetWeek, url: weekUrl } = useBudgetWeek(startOfWeek, endOfWeek, user)

    const handleClickTransactions = (uuid: string): void => {
      setActiveBudgetUuid(uuid)
      setIsOpenTransactionsForm(true)
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
        if (!budgetMonth) return

        _planned = budgetMonth.reduce(
          (acc: number, { plannedInCurrencies }: PlannedMap) => {
            return acc + plannedInCurrencies[userConfig?.currency]
          }, 0
        )
        _spent = budgetMonth.reduce(
          (acc: number, { spentInCurrencies }: SpentMap) => {
            return acc + (spentInCurrencies[userConfig?.currency] || 0)
          }, 0
        )
      } else {
        if (!budgetWeek) return

        _planned = budgetWeek.reduce(
          (acc: number, { plannedInCurrencies }: PlannedMap) => {
            return acc + plannedInCurrencies[userConfig?.currency]
          }, 0
        )
        _spent = budgetWeek.reduce(
          (acc: number, { spentInCurrencies }: SpentMap) => {
            return acc + (spentInCurrencies[userConfig?.currency] || 0)
          }, 0
        )
      }
      setPlannedSum(_planned)
      setSpentSum(_spent)
    }, [budgetMonth, budgetWeek])

    const handleTypeButtonClick = (type: BudgetType) => {
      router.push(`/budget/${type}`)
    }

    const changeUser = (userId: string): void => {
      setUser(userId);
    }

    const handleCloseModal = () => {
      setIsOpenDuplicateForm(false)
      setIsOpenTransactionsForm(false)
      setActiveBudgetUuid('')
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
          startIcon={<FileCopyIcon />}
          variant="outlined"
          onClick={() => setIsOpenDuplicateForm(true)}
        >
          Duplicate budget
        </Button>
        <AddForm
          monthUrl={monthUrl}
          weekUrl={weekUrl}
        />
      </Toolbar>
    )

    const header = (
      <div className="flex justify-between items-center gap-3">
        <div className="w-1/3">
          <GeneralSummaryCard planned={plannedSum} spent={spentSum} title={activeType} />
        </div>
        <div className="w-1/3 px-7">
          <Select
            onValueChange={changeUser}
            defaultValue="all"
            disabled={!users}
          >
            <SelectTrigger className="w-full border-2 hover:border-gray-300">
              <SelectValue placeholder="User" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Users</SelectLabel>
                <SelectItem value="all">All users</SelectItem>
                <DropdownMenuSeparator />
                { users && users.map((item: User) => (
                  <SelectItem value={item.uuid} key={item.uuid}>{item.username}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/3 h-auto">
          {activeType === "month" ?
            <MonthCalendar date={monthDate} setMonthDate={setMonthDate} /> :
            <WeekCalendar date={weekDate} setWeekDate={setWeekDate} />
          }
        </div>
      </div>
    );

    return (
      <>
        {toolbar}
        {!budgetMonth && (
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
        <div className="flex flex-col">
          <div className="w-full p-1 rounded shadow-sm shadow-zinc-300 bg-white">
            {header}
          </div>
          <div className="w-full mt-5">
            <Component
              startDate={startDate}
              endDate={endDate}
              clickShowTransactions={handleClickTransactions}
              mutateBudget={mutateBudget}
              user={user}
              weekUrl={weekUrl}
              monthUrl={monthUrl}
            />
          </div>
        </div>
        <DuplicateForm
          open={isOpenDuplicateForm}
          type={activeType}
          date={activeType === 'month' ? monthDate : weekDate}
          handleClose={handleCloseModal}
          mutateBudget={mutateBudget}
        />
        {activeBudgetUuid && (
          <>
            <TransactionsForm
              open={isOpenTransactionsForm}
              handleClose={handleCloseModal}
              uuid={activeBudgetUuid}
            />
          </>
        )
        }
      </>
    )
  }
}

export default withBudgetTemplate;
