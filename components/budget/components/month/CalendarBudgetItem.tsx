import { format, isSameDay } from "date-fns";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import React from "react";

import { useStore } from "@/app/store";
import { ConfirmDeleteForm, EditForm } from "@/components/budget/forms";
import { MonthBudgetItem } from "@/components/budget/types";
import * as Mnu from "@/components/ui/menu";
import * as Prg from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/numberUtils";

interface Types {
  item: MonthBudgetItem | undefined;
  date: Date;
  currency: string;
  clickShowTransactions: (uuid: string) => void;
}

const CalendarBudgetItem: React.FC<Types> = ({ item, date, currency, clickShowTransactions }) => {
  const [isEditDialogOpened, setIsEditDialogOpened] = React.useState<boolean>(false);
  const [isConfirmDeleteDialogOpened, setIsConfirmDeleteDialogOpened] =
    React.useState<boolean>(false);

  const currencySign = useStore((state) => state.currency.sign);

  if (item == null) {
    return (
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full">
          <span
            className={cn(
              isSameDay(date, new Date()) && "rounded-full bg-blue-500 px-1 font-bold text-white",
            )}
          >
            {format(date, "d")}
          </span>
        </div>
      </div>
    );
  }

  const spent: number = item.spentInCurrencies[currency];

  const planned: number = item.plannedInCurrencies[currency];

  const percentage: number = Math.floor((spent * 100) / planned) || 0;

  const handleClickTransactions = (): void => {
    clickShowTransactions(item.uuid);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full justify-between">
        <span
          className={
            isSameDay(date, new Date()) && "rounded-full bg-blue-500 px-1 font-bold text-white"
          }
        >
          {format(date, "d")}
        </span>
        <Mnu.Menu>
          <Mnu.MenuTrigger>
            <MoreVertical className="h-4 w-4 rounded-full border bg-white" />
          </Mnu.MenuTrigger>
          <Mnu.MenuPopup>
            <Mnu.MenuGroup>
              <Mnu.MenuGroupLabel>Transactions</Mnu.MenuGroupLabel>
              <Mnu.MenuItem onClick={handleClickTransactions}>List</Mnu.MenuItem>
            </Mnu.MenuGroup>
            <Mnu.MenuGroup>
              <Mnu.MenuGroupLabel>Actions</Mnu.MenuGroupLabel>
              <Mnu.MenuItem onClick={() => setIsEditDialogOpened(true)}>
                <Pencil className="mr-4 h-4 w-4" />
                <span>Edit</span>
              </Mnu.MenuItem>
              <Mnu.MenuItem onClick={() => setIsConfirmDeleteDialogOpened(true)}>
                <Trash2 className="mr-4 h-4 w-4" />
                <span>Delete</span>
              </Mnu.MenuItem>
            </Mnu.MenuGroup>
          </Mnu.MenuPopup>
        </Mnu.Menu>
      </div>
      <div className="flex w-full flex-col items-center justify-center">
        <span className="text-xs">
          {formatMoney(spent)} {currencySign}
        </span>
        <div className="relative w-full">
          <Prg.Progress
            className={cn(
              "h-5 rounded-sm",
              percentage > 100 && "bg-red-200",
              percentage <= 100 && "bg-gray-200",
            )}
            value={percentage > 100 ? percentage % 100 : percentage}
          >
            <Prg.ProgressIndicator
              className={cn(
                "rounded-sm",
                percentage > 100 && "bg-red-500",
                percentage <= 100 && "bg-green-500",
              )}
            />
          </Prg.Progress>
          <div className="absolute top-0 h-full w-full">
            <span className="flex h-full items-center justify-center text-xs font-semibold text-white">
              {planned === 0 ? "Not planned" : percentage}
            </span>
          </div>
        </div>
      </div>
      {isEditDialogOpened && (
        <EditForm uuid={item.uuid} open={isEditDialogOpened} setOpen={setIsEditDialogOpened} />
      )}
      {isConfirmDeleteDialogOpened && (
        <ConfirmDeleteForm
          uuid={item.uuid}
          open={isConfirmDeleteDialogOpened}
          setOpen={setIsConfirmDeleteDialogOpened}
          recurrent={item.recurrent}
          budgetDate={item.budgetDate}
        />
      )}
    </div>
  );
};

export default CalendarBudgetItem;
