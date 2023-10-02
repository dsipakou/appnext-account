import React from 'react'
import {
  Button
} from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import TransactionTable from '@/components/transactions/components/TransactionTable'
import { useLastAddedTransactions } from '@/hooks/transactions'

const LastAdded: React.FC = () => {
  const { data: transactions = [] } = useLastAddedTransactions() 

  return (
    <Dialog>
      <DialogTrigger>
        <Button>See last added</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col min-w-[1000px] h-screen my-20">
        <DialogHeader>
          <div className="flex justify-between pr-7">
            <DialogTitle>Transactions added since your last visit</DialogTitle>
            <Button>Mark as seen</Button>
          </div>
        </DialogHeader>
        <div className="h-full">
          <TransactionTable
            transactions={transactions}
            withDate={true}
            handleDeleteClick={() => {}}
            handleEditClick={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LastAdded
