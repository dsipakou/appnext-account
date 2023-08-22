import React from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog'
import TransactionTable from '@/components/transactions/components/TransactionTable'
import { useBudgetTransactions } from '@/hooks/transactions'

interface Props {
  open: boolean
  handleClose: () => void
  uuid: string
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const { data: budgetTransactions = [] } = useBudgetTransactions(uuid)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="flex flex-col min-w-[1000px] h-screen my-20">
        <DialogHeader>
          <DialogTitle>Transactions for selected budget</DialogTitle>
        </DialogHeader>
        <div className="h-full">
        <TransactionTable
          transactions={budgetTransactions}
          withDate={true}
          handleDeleteClick={()=>{}}
          handleEditClick={()=>{}}
        />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TransactionsForm
