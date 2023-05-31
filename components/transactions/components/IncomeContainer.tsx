import React from 'react'
import { useTransactions } from '@/hooks/transactions'
import { getFormattedDate } from '@/utils/dateUtils'
import TransactionTable from './TransactionTable'

const IncomeComponent: React.FC = () => {
  const {
    data: transactions,
    url: transactionsUrl
  } = useTransactions({
    sorting: 'added',
    limit: 10,
    type: 'income',
  })

  const handleDeleteClick = () => {

  }

  const handleEditClick = () => {

  }

  return (
  <div className="w-full">
    <TransactionTable
      transactions={transactions}
      handleDeleteClick={handleDeleteClick}
      handleDoubleClick={handleEditClick}
    />
  </div>
  )
}

export default IncomeComponent
