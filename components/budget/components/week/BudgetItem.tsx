import * as React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { Check, CheckCircle } from 'lucide-react'
import { formatMoney } from '@/utils/numberUtils'
import {
  Avatar,
  Chip,
} from '@mui/material'
import {
  deepOrange
} from '@mui/material/colors'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBudgetDetails } from '@/hooks/budget'
import { RecurrentTypes } from '@/components/budget/types'
import { useCurrencies } from '@/hooks/currencies'
import { useUsers, UserResponse } from '@/hooks/users'
import { useAuth } from '@/context/auth'
import { Currency } from '@/components/currencies/types'
import EditForm from '@/components/budget/forms/EditForm'
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm'
import { isSameDay } from 'date-fns'

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
    <div className={`flex flex-col group p-2 h-[100px] shadow-sm justify-between rounded-md hover:w-80 hover:border-double hover:border-2 hover:border-gray-400 hover:z-20 hover:shadow-xl w-full ${cssClass}`}>
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
              <div className="text-sm font-bold">
                {budgetUser.username.charAt(0)}
              </div>
            </Avatar>
          </div>
        )}
        {!isSameUser && (
          <div className="justify-center text-sm font-bold">
            <div className="hidden group-hover:flex">
              <Chip size="small" label={budgetUser.username} color="primary" />
            </div>
          </div>
        )}
        <div className="grow justify-start whitespace-nowrap text-ellipsis overflow-hidden text-sm font-semibold">
          {title}
        </div>
        {isCompleted && (
        <div class="flex-none justify-end">
          <CheckCircle className="text-green-600 h-4" />
        </div>
        )}
      </div>
      <div className="flex justify-center">
        <div className="hidden group-hover:flex text-sm font-semibold">
          {formatMoney(spent)}
        </div>
        <div className="hidden group-hover:flex ml-[3px] text-sm font-semibold">
          {currencySign}
        </div>
        <div className="hidden group-hover:flex text-xs font-semibold mx-2">
          of
        </div>
        <div className="text-xs">{formatMoney(planned)}</div>
        <div className="text-xs ml-[3px]">{currencySign}</div>
      </div>
      <div className="flex justify-center items-center">
        {planned !== 0
          ? (
            <>
              <Progress
                className={`h-1.5 ${percentage > 100 ? 'bg-red-200' : 'bg-gray-200'}`}
                indicatorClassName={`${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                value={percentage > 100 ? percentage % 100 : percentage}
              />
              <div className="text-xs font-bold ml-2">{`${percentage}%`}</div>
            </>
          )
          : (
            <div className="flex justify-center text-xs font-semibold w-full">
              Unplanned
            </div>
          )
        }
      </div>
      <div className="hidden h-full group-hover:flex group-hover:items-end justify-center gap-1 text-xs">
        <Button
          disabled={isLoading}
          variant="outline"
          className={`px-3 text-xs h-2 ${isCompleted ? 'bg-gray-400' : 'bg-white'}`}
          onClick={handleClickComplete}>
          <Check className={`h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
        </Button>
        <Button
          disabled={isLoading}
          variant="outline"
          className="px-3 text-xs h-2 bg-white"
          onClick={handleClickComplete}>
          Add spending
        </Button>
        <Button
          disabled={isLoading}
          variant="outline"
          className="px-3 text-xs h-2 bg-white"
          onClick={() => setIsEditDialogOpened(true)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          className="px-3 text-xs h-2"
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
