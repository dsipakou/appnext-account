import React from 'react';

import { ConfirmDeleteForm, EditIncomeForm } from '@/components/transactions/forms';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { TransactionResponse } from '../types';
import { TransactionsTable } from './transactionTable';

interface Types {
  transactions: TransactionResponse[];
  transactionsUrl: string;
  isLoading: boolean;
  year: number;
  setYear: (value: number) => void;
}

const IncomeComponent: React.FC<Types> = ({ transactions = [], transactionsUrl, isLoading, year, setYear }) => {
  const [isOpenEditIncome, setIsOpenEditIncome] = React.useState<boolean>(false);
  const [isOpenDeleteIncome, setIsOpenDeleteIncome] = React.useState<boolean>(false);
  const [activeIncomeUuid, setActiveIncomeUuid] = React.useState<string>('');

  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  const handleEditClick = (uuid: string): void => {
    setActiveIncomeUuid(uuid);
    setIsOpenEditIncome(true);
  };

  const handleDeleteClick = (uuid: string): void => {
    setActiveIncomeUuid(uuid);
    setIsOpenDeleteIncome(true);
  };

  const handleCloseModal = (): void => {
    setIsOpenDeleteIncome(false);
    setIsOpenEditIncome(false);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="m-3 flex flex-shrink-0 items-center justify-center gap-2">
        <Select defaultValue={year} onValueChange={setYear} disabled={isLoading}>
          <SelectTrigger className="relative h-8 w-24 bg-white text-lg">
            <SelectValue placeholder="Show income for the year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Year</SelectLabel>
              {years.map((year: number, index: number) => (
                <SelectItem value={year} key={index}>
                  {year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-h-0 flex-1 bg-white">
        <TransactionsTable
          transactions={transactions}
          url={transactionsUrl}
          categoryType="INC"
          disabledColumns={['budget']}
        />
      </div>
      {isOpenEditIncome && (
        <EditIncomeForm
          open={isOpenEditIncome}
          uuid={activeIncomeUuid}
          url={transactionsUrl}
          handleClose={handleCloseModal}
        />
      )}
      {isOpenDeleteIncome && (
        <ConfirmDeleteForm
          open={isOpenDeleteIncome}
          uuid={activeIncomeUuid}
          url={transactionsUrl}
          handleClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default IncomeComponent;
