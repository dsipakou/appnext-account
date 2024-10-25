// External
import React from 'react'
// Components
import TransactionsTable from '@/components/transactions/components/TransactionTableV2'
// UI
import * as Dlg from '@/components/ui/dialog'
// Hooks
import { useBudgetTransactions } from '@/hooks/transactions'

interface Props {
  open: boolean
  handleClose: () => void
  uuid: string
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const { data: budgetTransactions = [] } = useBudgetTransactions(uuid)

  return (
    <Dlg.Dialog open={open} onOpenChange={handleClose}>
      <Dlg.DialogTrigger></Dlg.DialogTrigger>
      <Dlg.DialogContent className="flex flex-col min-w-[1000px] h-screen my-20">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Transactions for selected budget</Dlg.DialogTitle>
        </Dlg.DialogHeader>
        <div className="h-full">
          <TransactionsTable
            transactions={budgetTransactions}
          />
        </div>
      </Dlg.DialogContent>
    </Dlg.Dialog>
  )
}

export default TransactionsForm
