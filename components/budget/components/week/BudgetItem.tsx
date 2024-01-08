import * as React from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useSWRConfig } from 'swr'
import { Check, CheckCircle, Edit, Plus, Repeat, ScrollText, Trash } from 'lucide-react'
import { formatMoney } from '@/utils/numberUtils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBudgetDetails } from '@/hooks/budget'
import { RecurrentTypes } from '@/components/budget/types'
import { useCurrencies } from '@/hooks/currencies'
import { useUsers, UserResponse } from '@/hooks/users'
import { Currency } from '@/components/currencies/types'
import EditForm from '@/components/budget/forms/EditForm'
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm'
import { AddForm } from '@/components/transactions/forms'

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
  mutateBudget: () => void
  clickShowTransactions: (uuid: string) => void
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
  mutateBudget,
  clickShowTransactions,
}) => {
  const [errors, setErrors] = React.useState<string>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false)
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false)
  const [isAddTransactionDialogOpened, setIsAddTransactionDialogOpened] = React.useState<boolean>(false)

  const { data: budgetDetails, url } = useBudgetDetails(uuid)
  const { data: currencies } = useCurrencies()
  const { data: users } = useUsers()
  const { data: { user: authUser }} = useSession()
  const { mutate } = useSWRConfig()

  const percentage: number = Math.floor(spent * 100 / planned)

  const currencySign = currencies.find(
    (currency: Currency) => currency.code === authUser.currency
  )?.sign || '';

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
      ? 'p-2 border-l-8 border-blue-400'
      : 'border-l-8 border-yellow-400'
    : 'border-gray-300'

  if (isCompleted) {
    cssClass = `bg-slate-300 ${cssClass}`
  } else {
    cssClass = `bg-white ${cssClass}`
  }

  return (
    <div className={`flex flex-col group p-2 h-[100px] shadow-sm justify-between rounded-md hover:scale-110 hover:w-80 border hover:border-double hover:border-2 hover:z-20 hover:shadow-xl w-full ${cssClass}`}>
      <div className='flex flex-row gap-1 items-center'>
        {!isSameUser && (
          <div className="flex group-hover:hidden">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs font-bold bg-sky-400 text-white">
                {budgetUser.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        {!isSameUser && (
          <div className="justify-center text-sm font-bold">
            <div className="hidden group-hover:flex">
              <Badge className="bg-sky-400">{budgetUser.username}</Badge>
            </div>
          </div>
        )}
        <div className="flex grow group-hover:text-base group-hover:ml-3 whitespace-nowrap text-ellipsis overflow-hidden text-sm font-semibold">
          <span>{title}</span>
        </div>
        {isCompleted && (
        <div className="flex-none justify-end">
          <CheckCircle className="text-green-600 h-4" />
        </div>
        )}
        {!!recurrent && (
          <div className={`hidden group-hover:flex items-center ${recurrent === 'monthly' ? 'text-blue-500' : 'text-yellow-500'}`}>
            <Repeat className="h-3" />
            <span className="text-xs">
              {recurrent}
            </span>
          </div>
        )}
      </div>
      <div className="flex h-full justify-center items-center">
        <div className="hidden group-hover:flex text-sm font-semibold">
          {formatMoney(spent)}
        </div>
        <div className="hidden group-hover:flex ml-[3px] text-sm font-semibold">
          {currencySign}
        </div>
        {
          planned !== 0 && (
            <div className="hidden group-hover:flex text-xs font-semibold mx-2">
              of
            </div>
          )
        }
        { planned !== 0 && (
          <div className="text-xs">{formatMoney(planned)}</div>
        )}
        <div className="text-xs ml-[3px]">{
          planned === 0 
            ? (
              <span className="hidden group-hover:flex ml-2">(not planned)</span>
            ) 
            : currencySign
        }</div>
      </div>
      <div className="flex justify-center items-center">
        {planned !== 0
          ? (
            <>
              <Progress
                className={`h-1.5 ${percentage > 100 ? 'bg-red-200' : 'bg-gray-200'}`}
                indicatorclassname={`${percentage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                value={percentage > 100 ? percentage % 100 : percentage}
              />
              <div className="text-xs font-bold ml-2">{`${percentage}%`}</div>
            </>
          )
          : (
            <Badge variant="secondary" className="flex font-normal group-hover:hidden text-xs tracking-widest">
              Not Planned
            </Badge>
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
          className="px-3 text-xs h-2 bg-slate-200 w-full"
          onClick={() => setIsAddTransactionDialogOpened(true)}>
          <Plus className="h-4 w-4"/>
        </Button>
        <Button
          disabled={isLoading}
          variant="outline"
          className="px-3 text-xs h-2 bg-white"
          onClick={() => clickShowTransactions(uuid)}
        >
          <ScrollText className="h-4 w-4" />
        </Button>
        <Button
          disabled={isLoading}
          variant="outline"
          className="px-3 text-xs h-2 bg-white"
          onClick={() => setIsEditDialogOpened(true)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          className="px-3 h-2 border-2 border-red-500"
          onClick={() => setIsConfirmDeleteDialogOpened(true)}
        >
          <Trash className="h-4 w-4" />
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
      {isAddTransactionDialogOpened && (
        <AddForm
          url={weekUrl}
          open={isAddTransactionDialogOpened}
          onOpenChange={setIsAddTransactionDialogOpened}
          budget={budgetDetails}
        />
      )}
    </div>
  )
}

export default BudgetItem
