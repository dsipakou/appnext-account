import * as React from 'react'
import { useSWRConfig } from 'swr'
import { useSession } from 'next-auth/react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useTransactions } from '@/hooks/transactions'
import { useCurrencies } from '@/hooks/currencies'
import {
  AddForm,
  AddIncomeForm,
  EditForm,
  ConfirmDeleteForm
} from '@/components/transactions/forms'
import { TransactionResponse } from '@/components/transactions/types'
import DailyChart from '@/components/transactions/components/DailyChart'
import { formatMoney } from '@/utils/numberUtils'
import { getFormattedDate } from '@/utils/dateUtils'
import { Currency } from '@/components/currencies/types'
import TransactionTable from './components/TransactionTable'
import IncomeComponent from './components/IncomeContainer'

export type TransactionType = 'outcome' | 'income'

const Index: React.FC = () => {
  const { data: { user } } = useSession()
  const { mutate } = useSWRConfig()
  const [transactionDate, setTransactionDate] = React.useState<Date>(new Date())
  const [isOpenAddTransactions, setIsOpenAddTransactions] = React.useState<boolean>(false)
  const [isOpenAddIncomeTransactions, setIsOpenAddIncomeTransactions] = React.useState<boolean>(false)
  const [isOpenEditTransactions, setIsOpenEditTransactions] = React.useState<boolean>(false)
  const [isOpenDeleteTransactions, setIsOpenDeleteTransactions] = React.useState<boolean>(false)
  const [activeTransactionUuid, setActiveTransactionUuid] = React.useState<string>('')
  const [activeType, setActiveType] = React.useState<TransactionType>('outcome')

  const {
    data: transactions,
    url: transactionsUrl
  } = useTransactions({
    sorting: 'added',
    limit: 50,
    dateFrom: getFormattedDate(transactionDate),
    dateTo: getFormattedDate(transactionDate)
  })

  const { data: currencies = [] } = useCurrencies()

  const currencySign = currencies.find((item: Currency) => item.code === user.currency)?.sign;

  const overallSum = transactions?.reduce((acc: number, item: TransactionResponse) => {
    return acc + item.spentInCurrencies[user.currency] || 0
  }, 0)

  const handleCloseModal = (): void => {
    setIsOpenAddTransactions(false)
    setIsOpenDeleteTransactions(false)
    setIsOpenEditTransactions(false)
    setIsOpenAddIncomeTransactions(false)
  }

  const handleDeleteClick = (uuid: string): void => {
    setActiveTransactionUuid(uuid)
    setIsOpenDeleteTransactions(true)
  }

  const handleEditClick = (uuid: string): void => {
    setActiveTransactionUuid(uuid)
    setIsOpenEditTransactions(true)
  }

  const mutateTransactions = (): void => {
    mutate(transactionsUrl)
  }

  return (
    <div className="flex flex-col">
      <div className="flex w-full px-6 my-3 justify-between items-center">
        <span className="text-xl font-semibold">Transactions</span>
        <div className="flex border bg-blue-500 rounded-md">
          <Button
            className="w-[180px] disabled:opacity-100 p-1"
            disabled={activeType === 'income'}
            variant="none"
            onClick={() => setActiveType('income')}
          >
            <span className={`text-xl ${activeType === 'income' ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
              Income
            </span>
          </Button>
          <Button
            className="w-[180px] disabled:opacity-100 p-1"
            disabled={activeType === 'outcome'}
            variant="none"
            onClick={() => setActiveType('outcome')}
          >
            <span className={`text-xl ${activeType === 'outcome' ? 'flex justify-center items-center text-xl rounded-md text-blue-500 bg-white w-full h-full' : 'text-white'}`}>
              Outcome
            </span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-blue-500 border-blue-500 hover:text-blue-600"
            onClick={() => setIsOpenAddIncomeTransactions(true)}
          >
            Add income
          </Button>
          <AddForm url={transactionsUrl} />
        </div>
      </div>
        { activeType === 'outcome' ?
          (
          <div className="grid grid-cols-7 gap-2">
            <div className="col-span-5 bg-white">
              <TransactionTable
                transactions={transactions}
                handleDeleteClick={handleDeleteClick}
                handleDoubleClick={handleEditClick}
              />
            </div>
            <div className="col-span-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col justify-center items-center border bg-white rounded-md p-3">
                  <span className="text-xl font-semibold mt-2">Transaction day</span>
                  <Calendar
                    mode="single"
                    selected={transactionDate}
                    onSelect={(day) => !!day && setTransactionDate(day)}
                    weekStartsOn={1}
                  />
                </div>
                <div className="flex flex-col flex-nowrap bg-white items-center justify-center rounded-md p-3">
                  <span className="text-xl font-semibold my-2">Day summary</span>
                  {transactions && (
                    <div className="flex gap-2 text-md">
                      <span className="font-semibold">{formatMoney(overallSum)}{currencySign}</span>
                      <span>spent in</span>
                      <span className="font-semibold">{transactions?.length}</span>
                      <span>transactions</span>
                    </div>
                  )}
                  <div className="flex">
                    <DailyChart
                      transactions={transactions}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        :
        (
          <IncomeComponent />
        )}
      <AddIncomeForm open={isOpenAddIncomeTransactions} handleClose={handleCloseModal} />
      {
        isOpenEditTransactions &&
        <EditForm
          uuid={activeTransactionUuid}
          open={isOpenEditTransactions}
          url={transactionsUrl}
          handleClose={handleCloseModal}
        />
      }
      <ConfirmDeleteForm
        open={isOpenDeleteTransactions}
        uuid={activeTransactionUuid}
        handleClose={handleCloseModal}
        mutateTransactions={mutateTransactions}
      />
    </div>
  )
}

export default Index
