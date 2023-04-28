import * as React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { formatMoney } from '@/utils/numberUtils'
import {
  Avatar,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material'
import {
  deepOrange
} from '@mui/material/colors'
import { useBudgetDetails } from '@/hooks/budget'
import { BudgetRequest, RecurrentTypes } from '@/components/budget/types'
import { useCurrencies } from '@/hooks/currencies'
import { useUsers, UserResponse } from '@/hooks/users'
import { useAuth } from '@/context/auth'
import { Currency } from '@/components/currencies/types'

interface Types {
  uuid: string
  title: string
  user: string
  planned: number
  spent: number
  isCompleted: boolean
  recurrent: RecurrentTypes
  clickEdit: (uuid: string) => void
  clickDelete: (uuid: string) => void
  mutateBudget: () => void
}

const BudgetItem: React.FC<Types> = ({
  uuid,
  title,
  user,
  planned,
  spent,
  isCompleted,
  recurrent,
  clickEdit,
  clickDelete,
  mutateBudget
}) => {
  const [showDetails, setShowDetails] = React.useState<boolean>(false)
  const [errors, setErrors] = React.useState<string>([])

  const { data: budgetDetails, url } = useBudgetDetails(uuid)
  const { data: currencies } = useCurrencies()
  const { data: users } = useUsers()
  const { user: authUser } = useAuth()
  const { mutate } = useSWRConfig()

  const percentage: number = Math.floor(spent * 100 / planned)

  const currencySign = currencies.find(
    (currency: Currency) => currency.code === authUser.currency
  )?.sign || '';


  const onMouseEnterHandler = (): void => {
    setShowDetails(true)
  }

  const onMouseLeaveHandler = (): void => {
    setShowDetails(false)
  }

  const handleClickEdit = (): void => {
    clickEdit(uuid)
  }

  const handleClickDelete = (): void => {
    clickDelete(uuid)
  }

  const budgetUser = users.find((item: UserResponse) => item.uuid === user)

  const isSameUser = budgetUser?.username === authUser?.username

  const handleClickComplete = (): void => {
    axios.patch(`budget/${uuid}/`, {
      isCompleted: !budgetDetails.isCompleted,
      category: budgetDetails.category
    }).then(
      res => {
        if (res.status === 200) {
          mutate(url)
          mutateBudget()
        } else {
          // TODO: handle errors
        }
      }
    ).catch(
      (error) => {
        const errRes = error.response.data;
        for (const prop in errRes) {
          setErrors(errRes[prop]);
          // TODO: Show errors somewhere
        }
      }
    ).finally(() => {
      // TODO: stop loading
    })
  }

  let cssClass = recurrent ?
    recurrent === 'monthly'
      ? 'p-2 rounded-l-xl border-l-8 border-blue-500'
      : 'rounded-l-xl border-l-8 border-yellow-500'
    : 'rounded-l-lg'

  if (isCompleted) {
    cssClass = `bg-slate-300 ${cssClass}`
  } else {
    cssClass = `bg-white ${cssClass}`
  }

  return (
    <div
      className={`p-2 rounded-md hover:w-80 hover:z-20 hover:shadow-xl w-full ${cssClass}`}
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <div class='flex flex-row gap-2 items-center'>
        {!isSameUser && !showDetails && (
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: deepOrange[500],
            }}
          >
            <Typography variant='caption'>
              {budgetUser.username.charAt(0)}
            </Typography>
          </Avatar>
        )}
        {!isSameUser && showDetails && (
          <Chip size="small" label={budgetUser.username} color="primary" />
        )}
        <Typography
          align="center"
          noWrap
          sx={{
            fontSize: showDetails ? '1em' : '0.9em',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
      </div>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        {showDetails && (
          <>
            <Typography
              sx={{
                fontSize: '0.9em',
                fontWeight: 'bold'
              }}
            >
              {formatMoney(spent)}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9em',
                marginLeft: '3px'
              }}
            >
              {currencySign}
            </Typography>
          </>
        )}
        {showDetails && (
          <Typography
            sx={{
              fontSize: '0.8em',
              mx: 1
            }}
          >
            of
          </Typography>
        )}
        <>
          <Typography
            sx={{
              fontSize: '0.8em'
            }}
          >
            {formatMoney(planned)}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8em',
              marginLeft: '3px'
            }}
          >
            {currencySign}
          </Typography>
        </>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {planned !== 0
          ? (
            <>
              <LinearProgress
                variant="determinate"
                color={percentage > 100 ? 'error' : 'success'}
                value={percentage > 100 ? percentage % 100 : percentage}
                sx={{
                  mx: 1,
                  width: '80%'
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.9em'
                }}
              >
                {`${percentage}%`}
              </Typography>
            </>
          )
          : (
            <Typography
              align="center"
              sx={{
                fontSize: '0.8em',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Unplanned
            </Typography>
          )
        }
      </Box>
      {!showDetails && (
        <Typography
          sx={{
            fontSize: '0.7em',
            color: 'blue',
            fontWeight: 'bold'
          }}
          align="center"
        >
          {isCompleted && 'Completed'}
        </Typography>
      )}
      {showDetails && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Button
            size="small"
            variant="contained"
            className={isCompleted ? 'bg-red-600' : 'bg-green-600'}
            color={budgetDetails?.isCompleted ? 'warning' : 'success'}
            disableElevation
            onClick={handleClickComplete}>
            {budgetDetails?.isCompleted ? 'Un-complete' : 'Complete'}
          </Button>
          <Button size="small" onClick={handleClickEdit}>Edit</Button>
          <Button size="small" onClick={handleClickDelete}>Delete</Button>
        </Box>
      )
      }
    </div>
  )
}

export default BudgetItem
