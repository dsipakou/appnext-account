import * as React from 'react'
import { useSWRConfig } from 'swr'
import {
  Box,
  Button,
  Grid,
  Stack,
  Toolbar,
  Typography
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { CalendarPicker } from '@mui/x-date-pickers/CalendarPicker';
import TransactionTable from './components/TransactionTable'
import { useTransactions } from '@/hooks/transactions'
import { useCurrencies } from '@/hooks/currencies'
import {
  AddForm,
  AddIncomeForm,
  EditForm,
  ConfirmDeleteForm
} from '@/components/transactions/forms'
import { useAuth } from '@/context/auth'
import { TransactionResponse } from '@/components/transactions/types'
import DailyChart from '@/components/transactions/components/DailyChart'
import { formatMoney } from '@/utils/numberUtils'
import { getFormattedDate } from '@/utils/dateUtils'
import locale from 'date-fns/locale/ru'
import { Currency } from '@/components/currencies/types'
import SourceSwitcher from './components/SourceSwitcher';

const Index: React.FC = () => {
  const { user } = useAuth();
  const { mutate } = useSWRConfig()
  const [transactionDate, setTransactionDate] = React.useState<Date>(new Date())
  const [isOpenAddTransactions, setIsOpenAddTransactions] = React.useState<boolean>(false)
  const [isOpenAddIncomeTransactions, setIsOpenAddIncomeTransactions] = React.useState<boolean>(false)
  const [isOpenEditTransactions, setIsOpenEditTransactions] = React.useState<boolean>(false)
  const [isOpenDeleteTransactions, setIsOpenDeleteTransactions] = React.useState<boolean>(false)
  const [activeTransactionUuid, setActiveTransactionUuid] = React.useState<string>('')

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

  const currencySign = currencies.find((item: Currency) => item.code === user?.currency)?.sign;

  const overallSum = transactions?.reduce((acc: number, item: TransactionResponse) => {
    return acc + item.spentInCurrencies[user?.currency] || 0
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
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Transactions</Typography>
        <Box sx={{ flexGrow: 7 }} />
        <SourceSwitcher />
        <Box sx={{ flexGrow: 7 }} />
        <Button
          variant="outlined"
          onClick={() => setIsOpenAddIncomeTransactions(true)}
        >
          Add income
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          className="bg-blue-500"
          sx={{ textTransform: 'none' }}
          onClick={() => setIsOpenAddTransactions(true)}
        >
          Add transactions
        </Button>
      </Toolbar>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TransactionTable
            transactions={transactions}
            handleDeleteClick={handleDeleteClick}
            handleDoubleClick={handleEditClick}
          />
        </Grid>
        <Grid item xs={4}>
          <Stack>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
              <CalendarPicker date={transactionDate} onChange={(newDate) => setTransactionDate(newDate)} />
            </LocalizationProvider>
            <div className="flex flex-col flex-nowrap bg-white rounded-md p-3">
              <div className="flex flex-col">
                <div className="flex mb-3">
                  <Typography variant="h4">
                    Day summary
                  </Typography>
                </div>
                {transactions && (
                  <Typography variant="subtitle">
                    <strong>{formatMoney(overallSum)}</strong>{currencySign} spent in <strong>{transactions?.length}</strong> transactions
                  </Typography>
                )}
              </div>
              <div className="flex">
                <DailyChart
                  transactions={transactions}
                />
              </div>
            </div>
          </Stack>
        </Grid>
      </Grid >
      <AddForm url={transactionsUrl} open={isOpenAddTransactions} handleClose={handleCloseModal} />
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
    </>
  )
}

export default Index
