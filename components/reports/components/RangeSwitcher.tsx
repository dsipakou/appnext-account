import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseAndFormatDate, REPORT_FORMAT } from '@/utils/dateUtils'

interface Types {
  dateFrom: string
  dateTo: string
  clickBack: () => void
  clickForward: () => void
}

const RangeSwitcher: React.FC<Types> = ({ dateFrom, dateTo, clickBack, clickForward }) => {

  const formattedDateFrom = parseAndFormatDate(dateFrom, REPORT_FORMAT)
  const formattedDateTo = parseAndFormatDate(dateTo, REPORT_FORMAT)

  return (
    <div className="flex">
      <div>
        <Button variant="ghost" onClick={clickBack}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xl font-light">{formattedDateFrom}</span>
        <span>. . .</span>
        <span className="text-xl font-light">{formattedDateTo}</span>
      </div>
      <div>
        <Button variant="ghost" onClick={clickForward}>
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  )
}

export default RangeSwitcher
