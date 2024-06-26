import * as React from 'react'
import { useStore } from '@/app/store'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { useSWRConfig } from 'swr'
import { Check, CheckCircle, Edit, Loader, Plus, Repeat, ScrollText, Trash } from 'lucide-react'
import { formatMoney } from '@/utils/numberUtils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBudgetDetails } from '@/hooks/budget'
import { CompactWeekItem } from '@/components/budget/types'
import { useUsers, UserResponse } from '@/hooks/users'
import EditForm from '@/components/budget/forms/EditForm'
import ConfirmDeleteForm from '@/components/budget/forms/ConfirmDeleteForm'
import { AddForm } from '@/components/transactions/forms'

interface Types {
  index: number
  budget: CompactWeekItem,
  weekUrl: string
  monthUrl: string
  mutateBudget: () => void
  clickShowTransactions: (uuid: string) => void
}

const BudgetItem: React.FC<Types> = ({
  budget,
  weekUrl,
  monthUrl,
  mutateBudget,
  clickShowTransactions
}) => {
  const [errors, setErrors] = React.useState<string>([])
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false)
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] = React.useState<boolean>(false)
  const [isAddTransactionDialogOpened, setIsAddTransactionDialogOpened] = React.useState<boolean>(false)

  const { data: users } = useUsers()
  const { data: { user: authUser } } = useSession()
  const { mutate } = useSWRConfig()

  const percentage: number = Math.floor(budget.spent * 100 / budget.planned)

  const currencySign = useStore((state) => state.currencySign)

  const budgetUser = users.find((item: UserResponse) => item.uuid === budget.user)

  const isSameUser = budgetUser?.username === authUser?.username

  const handleClickComplete = (): void => {
    setIsLoading(true)
    axios.patch(`budget/${budget.uuid}/`, {
      isCompleted: !budget.isCompleted,
      category: budget.category,
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
        const errRes = error.response.data
        for (const prop in errRes) {
          setErrors(errRes[prop])
          // TODO: Show errors somewhere
        }
      }
    ).finally(() => {
      setIsLoading(false)
    })
  }

  let cssClass = budget.recurrent
    ? budget.recurrent === 'monthly'
      ? 'p-2 border-l-8 border-blue-400'
      : 'border-l-8 border-yellow-400'
    : 'border-gray-300'

  if (budget.isCompleted) {
    cssClass = `bg-slate-300 grayscale-[40%] opacity-[90%] ${cssClass}`
  } else {
    cssClass = isSameUser ? `bg-white shadow-md ${cssClass}` : `bg-white text-blue-500 ${cssClass}`
  }

  return (
    <div className={`flex flex-col group p-2 h-[80px] hover:h-[100px] justify-between rounded-md hover:scale-110 hover:w-80 border hover:border-double hover:border-2 hover:z-20 hover:shadow-xl w-full ${cssClass}`}>
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
          <span>{budget.title}</span>
        </div>
        {budget.isCompleted && (
          <div className="flex-none justify-end">
            <CheckCircle className="text-green-600 h-4" />
          </div>
        )}
        {!!budget.recurrent && (
          <div className={`hidden group-hover:flex items-center ${budget.recurrent === 'monthly' ? 'text-blue-500' : 'text-yellow-500'}`}>
            <Repeat className="h-3" />
            <span className="text-xs">
              {budget.recurrent}
            </span>
          </div>
        )}
      </div>
      <div className="flex h-full justify-center items-center">
        <div className="group-hover:flex text-sm font-semibold">
          <span>{formatMoney(budget.spent)}</span>
          <span>
            {currencySign}
          </span>
        </div>
        {
          budget.planned !== 0 && (
            <div className="hidden group-hover:flex text-xs font-semibold mx-2">
              of
            </div>
          )
        }
        {budget.planned !== 0 && (
          <div className="flex text-xs">
            <span className="group-hover:hidden pl-1">(</span>
            <span>
              {formatMoney(budget.planned)}
            </span>
            <span className="group-hover:hidden">)</span>
            <span className="hidden group-hover:flex">{currencySign}</span>
          </div>
        )}
        <div className="text-xs ml-[3px]">{
          budget.planned === 0 &&
          (
            <span className="hidden group-hover:flex ml-2">(not planned)</span>
          )
        }
        </div>
      </div>
      <div className="flex justify-center items-center">
        {budget.planned !== 0
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
          className={`px-3 text-xs h-2 ${budget.isCompleted ? 'bg-gray-400' : 'bg-white'}`}
          onClick={handleClickComplete}>
          {!isLoading && <Check className={`h-4 ${budget.isCompleted ? 'text-white' : 'text-gray-400'}`} />}
          {isLoading && <Loader className={`h-4 ${budget.isCompleted ? 'text-white' : 'text-gray-400'}`} />}
        </Button>
        <Button
          disabled={isLoading}
          variant="outline"
          className="px-3 text-xs h-2 bg-slate-200 w-full"
          onClick={() => setIsAddTransactionDialogOpened(true)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          disabled={isLoading}
          variant="outline"
          className="px-3 text-xs h-2 bg-white"
          onClick={() => clickShowTransactions(budget.uuid)}
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
      {
        isEditDialogOpened && (
          <EditForm
            open={isEditDialogOpened}
            setOpen={setIsEditDialogOpened}
            uuid={budget.uuid}
            weekUrl={weekUrl}
            monthUrl={monthUrl}
          />
        )
      }
      {
        isConfirmDeleteDialogOpened && (
          <ConfirmDeleteForm
            open={isConfirmDeleteDialogOpened}
            setOpen={setIsConfirmDeleteDialogOpened}
            uuid={budget.uuid}
            weekUrl={weekUrl}
            monthUrl={monthUrl}
          />
        )
      }
      {isAddTransactionDialogOpened && (
        <AddForm
          url={weekUrl}
          open={isAddTransactionDialogOpened}
          onOpenChange={setIsAddTransactionDialogOpened}
          budget={budget}
        />
      )}
    </div>
  )
}

export default BudgetItem
