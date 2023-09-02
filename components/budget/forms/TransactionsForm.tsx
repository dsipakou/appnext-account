import React from 'react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog'
import {
  EditForm,
  ConfirmDeleteForm
} from '@/components/transactions/forms'
import TransactionTable from '@/components/transactions/components/TransactionTable'
import { useBudgetTransactions } from '@/hooks/transactions'

interface Props {
  open: boolean
  handleClose: () => void
  uuid: string
}

const TransactionsForm: React.FC<Props> = ({ open, handleClose, uuid }) => {
  const [isOpenEditTransactions, setIsOpenEditTransactions] = React.useState<boolean>(false)
  const [isOpenDeleteTransactions, setIsOpenDeleteTransactions] = React.useState<boolean>(false)
  const [activeTransactionUuid, setActiveTransactionUuid] = React.useState<string>('')

  const { data: budgetTransactions = [], url } = useBudgetTransactions(uuid)

  const handleDeleteClick = (uuid: string): void => {
    setActiveTransactionUuid(uuid)
    setIsOpenDeleteTransactions(true)
  }

  const handleEditClick = (uuid: string): void => {
    setActiveTransactionUuid(uuid)
    setIsOpenEditTransactions(true)
  }

  const handleCloseModal = (): void => {
    setIsOpenDeleteTransactions(false)
    setIsOpenEditTransactions(false)
  }

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
          handleDeleteClick={handleDeleteClick}
          handleEditClick={handleEditClick}
        />
        </div>
      </DialogContent>
      {
        isOpenEditTransactions &&
        <EditForm
          uuid={activeTransactionUuid}
          open={true}
          url={url}
          handleClose={handleCloseModal}
        />
      }
      {
        isOpenDeleteTransactions &&
        <ConfirmDeleteForm
          open={isOpenDeleteTransactions}
          uuid={activeTransactionUuid}
          url={url}
          handleClose={handleCloseModal}
        />
      }
    </Dialog>
  )
}

export default TransactionsForm
