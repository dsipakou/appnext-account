import * as React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { formatMoney } from '@/utils/numberUtils'
import {
  Avatar,
  Chip,
  LinearProgress,
  Typography
} from '@mui/material'
import {
  deepOrange
} from '@mui/material/colors'
import { Button } from '@/components/ui/button'
import { useBudgetDetails } from '@/hooks/budget'
import { RecurrentTypes } from '@/components/budget/types'
import { useCurrencies } from '@/hooks/currencies'
import { useUsers, UserResponse } from '@/hooks/users'
import { useAuth } from '@/context/auth'
import { Currency } from '@/components/currencies/types'
import EditForm from '@/components/budget/forms/EditForm'
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm'

interface Types {
  index: number
  uuid: string
  title: string
  user: string
  planned: number
  spent: number
  isCompleted: boolean
  recurrent: RecurrentTypes
  weekUrl: string
  monthUrl: string
  clickEdit: (uuid: string) => void
  clickDelete: (uuid: string) => void
  mutateBudget: () => void
}

const BudgetItem: React.FC<Types> = ({
  index,
  uuid,
  title,
  user,
  planned,
  spent,
  isCompleted,
  recurrent,
  weekUrl,
  monthUrl,
  clickEdit,
  clickDelete,
  mutateBudget
}) => {
  const [errors, setErrors] = React.useState<string>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false)
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false)

  const { data: budgetDetails, url } = useBudgetDetails(uuid)
  const { data: currencies } = useCurrencies()
  const { data: users } = useUsers()
  const { user: authUser } = useAuth()
  const { mutate } = useSWRConfig()

  const percentage: number = Math.floor(spent * 100 / planned)

  const currencySign = currencies.find(
    (currency: Currency) => currency.code === authUser.currency
  )?.sign || '';

  const handleClickEdit = (): void => {
    clickEdit(uuid)
  }

  const budgetUser = users.find((item: UserResponse) => item.uuid === user)

  const isSameUser = budgetUser?.username === authUser?.username

  const handleClickComplete = (): void => {
    setIsLoading(true)
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
        setIsLoading(false)
    })
  }

  let cssClass = recurrent ?
    recurrent === 'monthly'
      ? 'p-2 border-l-8 border-blue-500'
      : 'border-l-8 border-yellow-500'
    : ''

  if (isCompleted) {
    cssClass = `bg-slate-300 ${cssClass}`
  } else {
    cssClass = `bg-white ${cssClass}`
  }

  return (
    <div
      className={`group p-2 h-[100px] shadow-sm rounded-md hover:w-80 hover:z-20 hover:shadow-xl w-full ${cssClass}`}
    >
      <div className='flex flex-row gap-2 items-center'>
        {!isSameUser && (
          <div
            className="flex group-hover:hidden"
          >
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
          </div>
        )}
        {!isSameUser && (
          <div
            className="hidden group-hover:flex"
          >
          <Chip size="small" label={budgetUser.username} color="primary" />
          </div>
        )}
        <Typography
          align="center"
          noWrap
          sx={{
            fontSize: '0.9em',
            fontWeight: 'bold'
          }}
        >
          {title}
        </Typography>
      </div>
      <div className="flex justify-center">
        <Typography
          className="hidden group-hover:flex"
          sx={{
            fontSize: '0.9em',
            fontWeight: 'bold'
          }}
        >
          {formatMoney(spent)}
        </Typography>
        <Typography
          className="hidden group-hover:flex"
          sx={{
            fontSize: '0.9em',
            marginLeft: '3px'
          }}
        >
          {currencySign}
        </Typography>
        <Typography
          className="hidden group-hover:flex"
          sx={{
            fontSize: '0.8em',
            mx: 1
          }}
        >
          of
        </Typography>
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
      </div>
      <div className="flex justify-center">
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
      </div>
      <Typography
        className="flex justify-center group-hover:hidden"
        sx={{
          fontSize: '0.7em',
          color: `${isCompleted ? 'blue' : 'grey'}`,
          fontWeight: 'bold'
        }}
        align="center"
      >
        {isCompleted ? 'Completed' : 'To do'}
      </Typography>
      <div className="hidden group-hover:flex justify-center gap-1 text-xs">
        <Button
          size="small"
          disabled={isLoading}
          className={isCompleted ? 'px-3 bg-red-400 text-xs' : 'px-3 bg-green-400 text-xs'}
          color={budgetDetails?.isCompleted ? 'warning' : 'success'}
          onClick={handleClickComplete}>
          {budgetDetails?.isCompleted ? 'Un-complete' : 'Complete'}
        </Button>
        <Button
          size="small"
          disabled={isLoading}
          variant="ghost"
          className="px-3 text-xs"
          onClick={() => setIsEditDialogOpened(true)}
        >
          Edit
        </Button>
        <Button
          size="small"
          variant="ghost"
          className="px-3 text-xs text-red-500"
          onClick={() => setIsConfirmDeleteDialogOpened(true)}
        >
          Delete
        </Button>
      </div>
      <EditForm 
        open={isEditDialogOpened}
        setOpen={setIsEditDialogOpened}
        uuid={uuid} 
        weekUrl={weekUrl}
        monthUrl={monthUrl}
      />
      <ConfirmDeleteForm
        open={isConfirmDeleteDialogOpened}
        setOpen={setIsConfirmDeleteDialogOpened}
        uuid={uuid}
        weekUrl={weekUrl}
        monthUrl={monthUrl}
      />
    </div>
  )
}

export default BudgetItem
