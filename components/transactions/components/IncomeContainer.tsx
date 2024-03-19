import React, { Dispatch, SetStateAction } from 'react'
import {
  EditIncomeForm,
  ConfirmDeleteForm
} from '@/components/transactions/forms'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import TransactionTable from './TransactionTable'
import { TransactionResponse } from '../types'

interface Types {
  transactions: TransactionResponse[]
  isLoading: boolean
  year: number
  setYear: (value: number) => void
}

const IncomeComponent: React.FC<Types> = ({ transactions = [], isLoading, year, setYear }) => {
  const [isOpenEditIncome, setIsOpenEditIncome] = React.useState<boolean>(false)
  const [isOpenDeleteIncome, setIsOpenDeleteIncome] = React.useState<boolean>(false)
  const [activeIncomeUuid, setActiveIncomeUuid] = React.useState<string>('')

  const currentYear = new Date().getFullYear()
  const startYear = 2000
  const years = []

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year)
  }

  const handleEditClick = (uuid: string): void => {
    setActiveIncomeUuid(uuid)
    setIsOpenEditIncome(true)
  }

  const handleDeleteClick = (uuid: string): void => {
    setActiveIncomeUuid(uuid)
    setIsOpenDeleteIncome(true)
  }

  const handleCloseModal = (): void => {
    setIsOpenDeleteIncome(false)
    setIsOpenEditIncome(false)
  }

  return (
  <div className="flex flex-col w-full">
    <div className="flex items-center justify-center gap-2 m-3">
      <Select
        defaultValue={year}
        onValueChange={setYear}
        disabled={isLoading}
      >
        <SelectTrigger className="relative bg-white text-lg h-8 w-24">
          <SelectValue placeholder="Show income for the year" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Year</SelectLabel>
            {years.map((year: number, index: number) => (
              <SelectItem value={year} key={index}>{year}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <div className="flex bg-white">
      <TransactionTable
        transactions={transactions}
        withDate={true}
        showBudget={false}
        handleDeleteClick={handleDeleteClick}
        handleEditClick={handleEditClick}
      />
    </div>
    {
      isOpenEditIncome &&
      <EditIncomeForm
        open={isOpenEditIncome}
        uuid={activeIncomeUuid}
        url={transactionsUrl}
        handleClose={handleCloseModal}
      />
    }
    {
      isOpenDeleteIncome &&
      <ConfirmDeleteForm
        open={isOpenDeleteIncome}
        uuid={activeIncomeUuid}
        url={transactionsUrl}
        handleClose={handleCloseModal}
      />
    }
  </div>
  )
}

export default IncomeComponent
