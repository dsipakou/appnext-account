import * as React from 'react'
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
import { AddForm } from '@/components/transactions/forms'

const Index: React.FC = () => {
  const [transactionDate, setTransactionDate] = React.useState<Date>(new Date())
  const [isOpenAddTransactions, setIsOpenAddTransactions] = React.useState<boolean>(false)

  const {
    data: transactions
  } = useTransactions({
    sorting: 'added',
    limit: 50,
    dateFrom: getFormattedDate(transactionDate),
    dateTo: getFormattedDate(transactionDate)
  })

  const handleCloseModal = () => {
    setIsOpenAddTransactions(false)
  }

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Transactions</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={() => setIsOpenAddTransactions(true)}
        >
          Add transctions
        </Button>
      </Toolbar>
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TransactionTable transactions={transactions} />
        </Grid>
        <Grid item xs={4}>
          <Stack>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CalendarPicker date={transactionDate} onChange={(newDate) => setTransactionDate(newDate)} />
            </LocalizationProvider>
            <Grid container>
              <Grid item xs={12}>
                <Typography>
                  Day summary
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
      <AddForm open={isOpenAddTransactions} handleClose={handleCloseModal}/>
    </>
  )
}

export default Index
