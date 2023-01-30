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
import { getFormattedDate } from '@/utils/dateUtils'
import { AddForm, ConfirmDeleteForm } from '@/components/transactions/forms'
import { useAuth } from '@/context/auth'
import { TransactionResponse } from '@/components/transactions/types'
import DailyChart from '@/components/transactions/components/DailyChart'
import { formatMoney } from '@/utils/numberUtils'
import locale from 'date-fns/locale/ru'

const Index: React.FC = () => {
  const { user } = useAuth();
  const { mutate } = useSWRConfig()
  const [transactionDate, setTransactionDate] = React.useState<Date>(new Date())
  const [isOpenAddTransactions, setIsOpenAddTransactions] = React.useState<boolean>(false)
  const [isOpenDeleteTransactions, setIsOpenDeleteTransactions] = React.useState<boolean>(false)
  const [activeTransactionUuid, setActiveTransactionUuid] = React.useState<string>('')

  const {
    data: transactions,
    url: transactionUrl
  } = useTransactions({
    sorting: 'added',
    limit: 50,
    dateFrom: getFormattedDate(transactionDate),
    dateTo: getFormattedDate(transactionDate)
  })

  const overallSum = transactions?.reduce((acc: number, item: TransactionResponse) => {
    return acc + item.spentInCurrencies[user?.currency]
  }, 0)

  const handleCloseModal = (): void => {
    setIsOpenAddTransactions(false)
    setIsOpenDeleteTransactions(false)
  }

  const handleDeleteClick = (uuid: string): void => {
    setActiveTransactionUuid(uuid)
    setIsOpenDeleteTransactions(true)
  }

  const mutateTransactions = (): void => {
    mutate(transactionUrl)
  }

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Transactions</Typography>
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
          <TransactionTable transactions={transactions} handleDeleteClick={handleDeleteClick} />
        </Grid>
        <Grid item xs={4}>
          <Stack>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
              <CalendarPicker date={transactionDate} onChange={(newDate) => setTransactionDate(newDate)} />
            </LocalizationProvider>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h4">
                  Day summary
                </Typography>
                {transactions && (
                  <Typography variant="subtitle">
                    <strong>{formatMoney(overallSum)}</strong> spent in <strong>{transactions?.length}</strong> transactions
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <DailyChart
                  transactions={transactions}
                />
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      <AddForm url={transactionUrl} open={isOpenAddTransactions} handleClose={handleCloseModal}/>
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
