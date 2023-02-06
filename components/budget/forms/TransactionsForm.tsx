import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material'
import { useBudgetDetails } from '@/hooks/budget'
import { useBudgetTransactions } from '@/hooks/transactions'

interface Props {
  open: boolean
  handleClose: () => void
  uuid: string
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const {
    data: budgetTransactions = [],
    isLoading: isBudgetLoading
  } = useBudgetTransactions(uuid)

  console.log(budgetTransactions)

  return (
    <Dialog maxWidth="md" fullWidth={true} open={open} onClose={handleClose}>
      <DialogTitle>Transactions for selected budget</DialogTitle>
      <DialogContent>
        {budgetTransactions.map((item: unknown) => (
          <div key={item.uuid}>{item.transactionDate} {item.categoryDetails.name} {item.amount}</div>
        ))}
      </DialogContent>
    </Dialog>
  )
}

export default TransactionsForm
