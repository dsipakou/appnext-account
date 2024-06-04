import React from 'react'
import { Calendar } from 'lucide-react'
import { getFormattedDate, parseDate, DAY_MONTH_YEAR_FORMAT } from '@/utils/dateUtils'
import { TransactionResponse } from '../../types'

interface Types extends TransactionResponse { }

const DateReadComponentV2: React.FC<Types> = (transaction) => {
  const parsedDate = parseDate(transaction.transactionDate)
  const formattedDate = transaction.transactionDate ? getFormattedDate(parsedDate, DAY_MONTH_YEAR_FORMAT) : 'No date selected'

  return (
    <div className="flex w-full pl-2 items-center gap-2">
      <Calendar className="h-5" />
      <span className="text-sm">{formattedDate}</span>
    </div>
  )
}

export default DateReadComponentV2
