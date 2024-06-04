import React from 'react'
import { TransactionResponse } from '../../types'

interface Types extends TransactionResponse { }

const AmountReadComponentV2: React.FC<Types> = (transaction) => {
  const currencySign = transaction.currency?.sign || ''

  if (!transaction.amount) {
    return
  }

  return (
    <div className="flex w-full pl-2 items-center gap-2">
      <span className="text-sm font-semibold">{transaction.amount}</span><span>{currencySign}</span>
    </div>
  )
}

export default AmountReadComponentV2
