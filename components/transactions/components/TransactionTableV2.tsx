'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckIcon,
  CheckCheck,
  Copy,
  CreditCardIcon,
  MinusCircle,
  PencilIcon,
  PlusCircle,
  RotateCcw,
  Trash2,
  Upload,
  XIcon,
} from 'lucide-react';
import { useStore } from '@/app/store';
// UI
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Tbl from '@/components/ui/table';
import { User } from '@/components/users/types';
import AccountComponent from '@/components/transactions/forms/components/AccountComponentV2';
import BudgetComponent from '@/components/transactions/forms/components/BudgetComponentV2';
import CategoryComponent from '@/components/transactions/forms/components/CategoryComponentV2';
import DateComponent from '@/components/transactions/forms/components/DateComponentV2';
import CurrencyComponent from '@/components/transactions/forms/components/CurrencyComponentV2';
import { ConfirmDeleteForm } from '@/components/transactions/forms';
// Hooks
import { useAccounts } from '@/hooks/accounts';
import { useCategories } from '@/hooks/categories';
import { useCurrencies } from '@/hooks/currencies';
import { useUsers } from '@/hooks/users';
import { useBulkCreateTransaction, useCreateTransaction, useUpdateTransaction } from '@/hooks/transactions';
// Types
import { AccountResponse } from '@/components/accounts/types';
import { Currency } from '@/components/currencies/types';
import { TransactionBulkResponse, TransactionResponse } from '@/components/transactions/types';
import { CompactWeekItem } from '@/components/budget/types';
// Utils
import { getFormattedDate, parseDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface Types {
  transactions?: TransactionResponse[];
  url?: string;
  mode?: 'view' | 'bulk';
  budget?: CompactWeekItem;
  disabledColumns?: string[];
  handleCanClose?: (flag: boolean) => void;
}

export type RowData = {
  id: number;
  uuid?: string | undefined;
  date: Date;
  account: string;
  budget: string | null;
  budgetName: string;
  category: string;
  categoryName: string;
  categoryParentName: string;
  outcome: number;
  outcomeInDefaultCurrency?: number;
  currency: string;
  inBase: number;
};

const allColumns = ['date', 'account', 'budget', 'category', 'outcome'];
const cellWidthMap = {
  date: 'w-1/6',
  account: 'w-1/6',
  budget: 'w-1/6',
  category: 'w-full',
  outcome: 'w-2/6',
};

export default function TransactionsTable({
  transactions = undefined,
  budget = undefined,
  mode = 'view',
  disabledColumns = [],
  handleCanClose = () => {},
}: Types) {
  const [data, setData] = useState<RowData[]>([]);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [editedRows, setEditedRows] = useState<{ [key: number]: RowData }>({});
  const [snapshots, setSnapshots] = useState<RowData[][]>([]);
  const [isOpenDeleteTransactions, setIsOpenDeleteTransactions] = React.useState<boolean>(false);
  const [rowToDelete, setRowToDelete] = React.useState<RowData | null>(null);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSavedRemote, setIsSavedRemote] = useState(false);
  const [changedFields, setChangedFields] = useState<{ [key: number]: Set<keyof RowData> }>({});
  const [nextId, setNextId] = useState<number>(0);
  const [invalidFields, setInvalidFields] = useState<{ [key: number]: Set<keyof RowData> }>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof RowData; direction: 'ascending' | 'descending' } | null>(
    null
  );
  const [newRows, setNewRows] = useState<Set<number>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(allColumns));

  const currencyInputRef = useRef<HTMLInputElement>(null);

  const { trigger: createTransaction, isMutating: isCreating } = useCreateTransaction();
  const { trigger: updateTransaction, isMutating: isUpdating } = useUpdateTransaction();
  const { trigger: bulkCreateTransaction, isMutating: isBulkCreating } = useBulkCreateTransaction();

  const {
    data: { user: authUser },
  } = useSession();
  const { data: users = [] } = useUsers();
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { data: currencies = [] } = useCurrencies();

  const defaultCurrencySign = useStore((state) => state.currencySign);
  const baseCurrency = currencies.find((item: Currency) => item.isBase);
  const defaultCurrency = currencies.find((item: Currency) => item.isDefault);

  React.useEffect(() => {
    if (disabledColumns.length > 0) {
      setVisibleColumns(new Set(allColumns.filter((column) => !disabledColumns.includes(column))));
    }
  }, [disabledColumns]);

  React.useEffect(() => {
    if (!authUser || users.length === 0) return;

    const _user = users.find((item: User) => item.username === authUser.username)!;
    setUser(_user.uuid);
  }, [authUser, users]);

  React.useEffect(() => {
    resetEditing();
    let validatedData: RowData[] = [];
    if (mode === 'view' && transactions.length > 0) {
      validatedData = transactions.map((item: TransactionResponse, index: number) => ({
        id: index,
        uuid: item.uuid,
        date: new Date(item.transactionDate),
        account: item.account,
        budget: item.budget,
        budgetName: item.budgetDetails?.title,
        category: item.category,
        categoryName: item.categoryDetails.name,
        categoryParentName: item.categoryDetails.parentName,
        outcome: item.amount,
        outcomeInDefaultCurrency: item.spentInCurrencies[authUser.currency],
        currency: item.currency,
        inBase: item.spentInCurrencies[baseCurrency?.code],
      }));
    }
    setData(validatedData);
    setNextId(validatedData.length);
    setSnapshots([validatedData]);
  }, [transactions]);

  React.useEffect(() => {
    if (isSavedRemote) {
      createSnapshot();
    }
  }, [isSavedRemote]);

  React.useEffect(() => {
    if (budget) {
      handleAddNewTransaction(budget);
    }
  }, [budget]);

  React.useEffect(() => {
    const hasNoChangedFields = Object.values(changedFields).every((set) => set.size === 0);
    if ((isSubmitted || hasNoChangedFields) && editingRows.size === 0) {
      handleCanClose(true);
    } else {
      handleCanClose(false);
    }
  }, [isSubmitted, changedFields, editingRows]);

  const resetEditing = () => {
    setEditingRows(new Set());
    setEditedRows({});
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    setChangedFields({});
    setInvalidFields({});
    setNewRows(new Set());
  };

  const clearTable = () => {
    resetEditing();
    setData([]);
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    let keys: Array<keyof RowData>;
    switch (sortConfig?.key) {
      case 'date':
        keys = ['date'];
        break;
      case 'account':
        keys = ['account'];
        break;
      case 'budget':
        keys = ['budgetName'];
        break;
      case 'category':
        keys = ['categoryParentName', 'categoryName'];
        break;
      case 'outcome':
        keys = ['outcome'];
        break;
      default:
        keys = ['id'];
    }

    const direction = sortConfig?.direction || 'ascending';
    sortableItems.sort((a: RowData, b: RowData) => {
      const keyA = keys.length > 1 ? keys.map((key) => a[key]).join('') : a[keys[0]];
      const keyB = keys.length > 1 ? keys.map((key) => b[key]).join('') : b[keys[0]];
      if (keyA < keyB) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (keyA > keyB) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [data, sortConfig]);

  const totalSum = useMemo(() => {
    return sortedData.reduce((sum, row: RowData) => sum + Number(row.outcome), 0);
  }, [sortedData]);

  const requestSort = (key: keyof RowData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else {
        setSortConfig(null);
        return;
      }
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (row: RowData) => {
    setEditingRows((prev) => new Set(prev).add(row.id));
    setEditedRows((prev) => ({ ...prev, [row.id]: { ...row } }));
  };

  const handleSaveTransaction = async (row: RowData): Promise<void> => {
    const res = await createTransaction({
      account: row.account,
      amount: Number(row.outcome).toFixed(2),
      budget: row.budget,
      category: row.category,
      currency: row.currency,
      transactionDate: getFormattedDate(row.date),
      type: 'outcome',
      user,
    });
    setData((prevData: RowData[]) =>
      prevData.map((r) =>
        r.id === row.id
          ? {
              ...r,
              uuid: res.uuid,
              account: res.account,
              budget: res.budget,
              budgetName: res.budgetDetails?.title,
              category: res.category,
              categoryName: res.categoryDetails.name,
              categoryParentName: res.categoryDetails.parentName,
              currency: res.currency,
              date: parseDate(res.transactionDate),
              outcome: res.amount,
              outcomeInDefaultCurrency: res.spentInCurrencies[authUser.currency],
              inBase: res.spentInCurrencies[baseCurrency?.code],
            }
          : r
      )
    );
    setIsSavedRemote(true);
  };

  const handleUpdateTransaction = async (row: RowData): Promise<void> => {
    const res = await updateTransaction({
      uuid: row.uuid,
      account: row.account,
      amount: Number(row.outcome).toFixed(2),
      budget: row.budget,
      category: row.category,
      currency: row.currency,
      transactionDate: getFormattedDate(row.date),
      type: 'outcome',
      user,
    });
    setData((prevData: RowData[]) =>
      prevData.map((r) =>
        r.id === row.id
          ? {
              ...r,
              uuid: res.uuid,
              account: res.account,
              budget: res.budget,
              budgetName: res.budgetDetails.title,
              category: res.category,
              categoryName: res.categoryDetails.name,
              categoryParentName: res.categoryDetails.parentName,
              currency: res.currency,
              date: parseDate(res.transactionDate),
              outcome: res.amount,
              outcomeInDefaultCurrency: res.spentInCurrencies[authUser.currency],
              inBase: res.spentInCurrencies[baseCurrency?.code],
            }
          : r
      )
    );
    setIsSavedRemote(true);
  };

  const handleBulkCreate = async (transactions: RowData[]) => {
    const res = await bulkCreateTransaction(
      transactions.map((row: RowData) => ({
        rowId: row.id,
        uuid: row.uuid,
        account: row.account,
        amount: Number(row.outcome).toFixed(2),
        budget: row.budget,
        category: row.category,
        currency: row.currency,
        transactionDate: getFormattedDate(row.date),
        type: 'outcome',
        user,
      }))
    );
    const resultMap = new Map(res.map((transaction: TransactionBulkResponse) => [transaction.rowId, transaction]));
    setData((prevData: RowData[]) =>
      prevData.map((r) =>
        resultMap.has(r.id)
          ? {
              ...r,
              uuid: resultMap.get(r.id)!.uuid,
              account: resultMap.get(r.id)!.account,
              budget: resultMap.get(r.id)!.budget,
              budgetName: resultMap.get(r.id)!.budgetDetails.title,
              category: resultMap.get(r.id)!.category,
              categoryName: resultMap.get(r.id)!.categoryDetails.name,
              categoryParentName: resultMap.get(r.id)!.categoryDetails.parentName,
              currency: resultMap.get(r.id)!.currency,
              date: parseDate(resultMap.get(r.id)!.transactionDate),
              outcome: resultMap.get(r.id)!.amount,
              outcomeInDefaultCurrency: resultMap.get(r.id)!.spentInCurrencies[authUser.currency],
              inBase: resultMap.get(r.id)!.spentInCurrencies[baseCurrency?.code],
            }
          : r
      )
    );
    setIsSavedRemote(true);
  };

  const handleSave = async (id: number) => {
    const rowToSave = editedRows[id];
    const invalidFieldsForRow = new Set<keyof RowData>();
    const isChanged = changedFields[rowToSave.id];
    const isEdited = changedFields[id]?.size > 0;

    if (!rowToSave.date) invalidFieldsForRow.add('date');
    if (!rowToSave.account) invalidFieldsForRow.add('account');
    if (!rowToSave.budget) invalidFieldsForRow.add('budget');
    if (!rowToSave.category) invalidFieldsForRow.add('category');
    if (!rowToSave.outcome) invalidFieldsForRow.add('outcome');
    if (!rowToSave.currency) invalidFieldsForRow.add('currency');

    if (invalidFieldsForRow.size > 0) {
      setInvalidFields((prev) => ({ ...prev, [id]: invalidFieldsForRow }));
      return;
    }

    setEditingRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    if (mode === 'view') {
      if (rowToSave.uuid) {
        try {
          // TODO: disable row
          await handleUpdateTransaction(rowToSave);
        } catch (error) {
          // TODO: ERROR
        }
      } else {
        try {
          // TODO: disable row
          await createTransaction({
            account: rowToSave.account,
            amount: Number(rowToSave.outcome).toFixed(2),
            budget: rowToSave.budget,
            category: rowToSave.category,
            currency: rowToSave.currency,
            transactionDate: getFormattedDate(rowToSave.date),
            type: 'outcome',
            user,
          });
        } catch (error) {
          // TODO: ERROR
          return;
        } finally {
          setData((prevData) => [...prevData, rowToSave]);
          // mutate(transactionsUrl)
        }
      }
    } else {
      setData((prevData) => {
        const newData = prevData.map((row) => (row.id === id ? rowToSave : row));
        const changedKeys = Object.keys(rowToSave).filter(
          (key) =>
            JSON.stringify(rowToSave[key as keyof RowData]) !==
            JSON.stringify(snapshots[currentSnapshotIndex]?.find((r) => r.id === id)?.[key as keyof RowData])
        ) as Array<keyof RowData>;

        setChangedFields((prev) => ({
          ...prev,
          [id]: new Set(changedKeys),
        }));

        setIsSubmitted(false);
        setInvalidFields((prev) => {
          const newInvalidFields = { ...prev };
          delete newInvalidFields[id];
          return newInvalidFields;
        });
        return newData;
      });
      setNewRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRevert = (id: number) => {
    const originalRow = snapshots[currentSnapshotIndex].find((row) => row.id === id);
    if (originalRow) {
      setData((prevData) => prevData.map((row) => (row.id === id ? originalRow : row)));
      setChangedFields((prev) => ({
        ...prev,
        [id]: new Set(),
      }));
      setEditedRows((prev) => ({
        ...prev,
        [id]: originalRow,
      }));
    }
  };

  const formatValue = (input: string) => {
    // Remove any non-digit and non-dot characters
    let formatted = input.replace(',', '.').replace(/[^\d.]/g, '');

    // Ensure only one dot
    const parts = formatted.split('.');
    if (parts.length > 2) {
      formatted = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to two decimal places
    const [integerPart, decimalPart] = formatted.split('.');
    if (decimalPart && decimalPart.length > 2) {
      formatted = integerPart + '.' + decimalPart.slice(0, 2);
    }

    return formatted;
  };

  const handleAmountChange = (id: number, field: keyof RowData, value: any) => {
    const formattedValue = formatValue(value);
    setEditedRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: formattedValue },
    }));
    setInvalidFields((prev) => {
      const newInvalidFields = { ...prev };
      if (newInvalidFields[id]) {
        newInvalidFields[id].delete(field);
        if (newInvalidFields[id].size === 0) {
          delete newInvalidFields[id];
        }
      }
      return newInvalidFields;
    });
  };

  const handleChange = (id: number, field: keyof RowData, value: any) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
    setInvalidFields((prev) => {
      const newInvalidFields = { ...prev };
      if (newInvalidFields[id]) {
        newInvalidFields[id].delete(field);
        if (newInvalidFields[id].size === 0) {
          delete newInvalidFields[id];
        }
      }
      return newInvalidFields;
    });
  };

  const handleCancel = (id: number) => {
    setEditingRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditedRows((prev) => {
      const newEditedRows = { ...prev };
      delete newEditedRows[id];
      return newEditedRows;
    });
  };

  const createSnapshot = useCallback(() => {
    setSnapshots((prev) => [...prev.slice(0, currentSnapshotIndex + 1), data]);
    setCurrentSnapshotIndex((prev) => prev + 1);
    setChangedFields(data.reduce((acc, row) => ({ ...acc, [row.id]: new Set() }), {}));
    setIsSubmitted(true);
    setNewRows(new Set());
    setIsSavedRemote(false);
  }, [data, currentSnapshotIndex]);

  const handleSubmit = async () => {
    const transactions: RowData[] = [];
    data.forEach(async (row: RowData, index: number) => {
      const editedRow = editedRows[row.id];
      const isEdited = changedFields[row.id]?.size > 0;
      if (isEdited) {
        if (!row.uuid) {
          setIsLoading(true);
          transactions.push(editedRow);
        } else {
          try {
            setIsLoading(true);
            await handleUpdateTransaction(editedRow);
          } catch (error) {
            console.log('errorUpdate', error);
          } finally {
            setIsLoading(false);
          }
        }
      }
    });
    if (transactions.length) {
      try {
        await handleBulkCreate(transactions);
      } catch (error) {
        console.log('errorBulkCreate', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddNewTransaction = (budget: CompactWeekItem | undefined = undefined) => {
    const newRow: RowData = {
      id: nextId,
      uuid: undefined,
      date: budget?.budgetDate ? parseDate(budget.budgetDate) : new Date(),
      account: '',
      budget: budget?.uuid || '',
      budgetName: budget?.title || '',
      category: budget?.category || '',
      categoryName: '',
      categoryParentName: '',
      outcome: budget?.amount || 0,
      outcomeInDefaultCurrency: 0,
      currency: budget?.currency || '',
      inBase: 0,
    };
    setData((prevData) => [...prevData, newRow]);
    setEditingRows((prev) => new Set(prev).add(nextId));
    setEditedRows((prev) => ({ ...prev, [nextId]: newRow }));
    setChangedFields((prev) => ({ ...prev, [nextId]: new Set() }));
    setNextId((prev) => prev + 1);
    setIsSubmitted(false);
    setNewRows((prev) => new Set(prev).add(nextId));
  };

  const handleDuplicate = (row: RowData) => {
    const newRow: RowData = {
      ...row,
      id: nextId,
      uuid: undefined,
      inBase: 0,
    };
    setData((prevData) => [...prevData, newRow]);
    setEditingRows((prev) => new Set(prev).add(nextId));
    setEditedRows((prev) => ({ ...prev, [nextId]: newRow }));
    setChangedFields((prev) => ({ ...prev, [nextId]: new Set() }));
    setNextId((prev) => prev + 1);
    setIsSubmitted(false);
    setNewRows((prev) => new Set(prev).add(nextId));
    setTimeout(() => {
      if (currencyInputRef.current) {
        currencyInputRef.current.focus();
        currencyInputRef.current.select();
      }
    }, 0);
  };

  const handleRemoveCompleted = (id: number) => {
    setData((prevData) => prevData.filter((row) => row.id !== id));
    setEditingRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setEditedRows((prev) => {
      const newEditedRows = { ...prev };
      delete newEditedRows[id];
      return newEditedRows;
    });
    setChangedFields((prev) => {
      const newChangedFields = { ...prev };
      delete newChangedFields[id];
      return newChangedFields;
    });
    setInvalidFields((prev) => {
      const newInvalidFields = { ...prev };
      delete newInvalidFields[id];
      return newInvalidFields;
    });
    setNewRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleRemove = (id: number) => {
    const row = data.find((row) => row.id === id);
    if (row?.uuid) {
      setRowToDelete(row);
      setIsOpenDeleteTransactions(true);
      return;
    } else {
      handleRemoveCompleted(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(id);
    }
  };

  const renderCell = (row: RowData, key: keyof RowData) => {
    const isEditing = editingRows.has(row.id);
    const value = isEditing ? editedRows[row.id][key] : row[key];
    const currencyValue = isEditing ? editedRows[row.id]['currency'] : row['currency'];
    const isChanged = changedFields[row.id]?.has(key);
    const isCurrencyChanged = changedFields[row.id]?.has('currency');
    const isSaved = !!row.uuid;
    const isInvalid = invalidFields[row.id]?.has(key);
    const isNew = newRows.has(row.id);
    const editedRow = editedRows[row.id];

    const cellStyle = isEditing || isChanged || isNew ? 'text-yellow-500' : '';
    const inputStyle = `w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 ${isInvalid ? 'outline outline-red-400' : ''}`;

    if (!isEditing) {
      switch (key) {
        case 'date':
          return (
            <div className="px-1 flex items-center justify-center">
              <Badge variant="outline" className={`text-xs font-medium ${cellStyle}`}>
                {format(value as Date, 'dd MMM yyyy')}
              </Badge>
            </div>
          );
        case 'account':
          return (
            <div className={`px-1 flex items-center ${cellStyle}`}>
              <CreditCardIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{accounts.find((item: AccountResponse) => item.uuid === value)?.title}</span>
            </div>
          );
        case 'budget':
          return (
            <Badge variant="outline" className={`px-2 ${cellStyle} truncate`}>
              {row.budgetName}
            </Badge>
          );
        case 'category':
          return (
            <div className={`px-1 py-1 flex items-center ${cellStyle}`}>
              <span className="font-medium truncate">{row.categoryParentName}</span>
              <span className="mx-1">/</span>
              <span className="text-muted-foreground truncate">{row.categoryName}</span>
            </div>
          );
        case 'outcome':
          const transactionCurrency = currencies.find((item: Currency) => item.uuid === row.currency);
          return (
            <div className={cn(cellStyle, 'flex justify-between px-2 text-right')}>
              <div className="flex items-center gap-1">
                <span className="font-semibold">
                  {isSaved && !isCurrencyChanged && !isChanged ? row.outcomeInDefaultCurrency?.toFixed(2) : row.outcome}
                </span>
                <span className={cn(isCurrencyChanged && 'text-yellow-500 font-bold')}>
                  {isSaved && !isCurrencyChanged ? defaultCurrencySign : transactionCurrency?.sign}
                </span>
              </div>
              {/* TODO: revert do not return base currency */}
              {isSaved && !isChanged && !isCurrencyChanged && (
                <div className="flex flex-col w-20">
                  {defaultCurrency !== transactionCurrency && baseCurrency !== transactionCurrency && (
                    <span className="ml-1 text-muted-foreground text-[0.6rem]">
                      ({row.outcome} {transactionCurrency.sign})
                    </span>
                  )}
                  <span className="ml-1 text-muted-foreground text-[0.6rem]">
                    ({Number(row.inBase)?.toFixed(2)} {baseCurrency?.sign})
                  </span>
                </div>
              )}
            </div>
          );
        case 'currency':
        case 'outcomeInDefaultCurrency':
          return;
      }
    }

    const commonInputClass = `w-full h-8 px-2 text-sm border-0 focus:ring-2 focus:border-primary ${inputStyle}`;

    switch (key) {
      case 'date':
        return (
          <DateComponent
            user={user}
            value={value as Date}
            handleChange={handleChange}
            row={editedRow}
            isInvalid={isInvalid}
          />
        );
      case 'account':
        return (
          <AccountComponent
            value={value as string}
            user={budget?.user || user}
            accounts={accounts}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            row={editedRow}
            isInvalid={isInvalid}
          />
        );
      case 'budget':
        return (
          <BudgetComponent
            user={user}
            value={value as string}
            accounts={accounts}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            row={editedRow}
            isInvalid={isInvalid}
          />
        );
      case 'category':
        return (
          <CategoryComponent
            user={user}
            value={value as string}
            categories={categories}
            handleChange={handleChange}
            handleKeyDown={handleKeyDown}
            row={editedRow}
            isInvalid={isInvalid}
            defaultOpen={!!budget}
          />
        );
      case 'outcome':
        return (
          <div className="flex gap-2">
            <div className="flex items-center h-8 w-28">
              <Input
                type="text"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={value}
                pattern="[0-9]+([\,][0-9]+)?"
                onChange={(e) => handleAmountChange(row.id, key, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, row.id)}
                onClick={(e) => e.currentTarget.select()}
                className={`${commonInputClass} text-right`}
                ref={row.id === nextId - 1 ? currencyInputRef : null}
                required
              />
              <span className="ml-1">
                {currencies.find((item: Currency) => item.uuid === editedRows[row.id].currency)?.sign}
              </span>
            </div>
            <CurrencyComponent
              user={user}
              value={currencyValue as string}
              handleChange={handleChange}
              handleKeyDown={handleKeyDown}
              row={editedRow}
              isInvalid={isInvalid}
              isSaved={isSaved}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      {mode === 'bulk' && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleAddNewTransaction()}
              variant="outline"
              className="text-blue-500 border-blue-500 border hover:text-blue-600"
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add transaction
            </Button>
          </div>
          <div className="flex gap-3">
            {isSubmitted ||
            Object.values(changedFields).every((set) => {
              return set.size === 0;
            }) ? (
              <span className="text-gray-500 text-xs">Nothing to upload</span>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={editingRows.size > 0 || isLoading}
                className="h-8 px-2 border-green-600 text-xs font-medium bg-green-600 text-white hover:bg-green-800"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? 'Saving...' : 'Upload transactions'}
              </Button>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <span>Total:</span>
            <span className="font-bold">{totalSum.toFixed(2)}</span>
            <Button variant="secondary" onClick={() => clearTable()} disabled={data.length === 0}>
              Clear the table
            </Button>
          </div>
        </div>
      )}
      <div className="border rounded-lg">
        <div className="max-h-[calc(100vh-300px)] overflow-auto relative">
          <Tbl.Table>
            <Tbl.TableHeader className="sticky top-0 bg-white z-10 after:absolute after:bottom-0 after:w-full after:h-px after:bg-border">
              <Tbl.TableRow className="bg-muted/50">
                {visibleColumns.has('date') && (
                  <Tbl.TableHead className="flex cursor-pointer" onClick={() => requestSort('date')}>
                    <div className="flex items-center">
                      Date
                      {sortConfig?.key === 'date' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ArrowUp className="ml-2 h-4 w-4 text-black" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4 text-black" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </Tbl.TableHead>
                )}
                {visibleColumns.has('account') && (
                  <Tbl.TableHead className="cursor-pointer" onClick={() => requestSort('account')}>
                    <div className="flex items-center">
                      Account
                      {sortConfig?.key === 'account' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ArrowUp className="ml-2 h-4 w-4 text-black" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4 text-black" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </Tbl.TableHead>
                )}
                {visibleColumns.has('budget') && (
                  <Tbl.TableHead className="cursor-pointer" onClick={() => requestSort('budget')}>
                    <div className="flex items-center">
                      Budget
                      {sortConfig?.key === 'budget' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ArrowUp className="ml-2 h-4 w-4 text-black" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4 text-black" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </Tbl.TableHead>
                )}
                {visibleColumns.has('category') && (
                  <Tbl.TableHead className="cursor-pointer" onClick={() => requestSort('category')}>
                    <div className="flex items-center">
                      Category
                      {sortConfig?.key === 'category' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ArrowUp className="ml-2 h-4 w-4 text-black" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4 text-black" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </Tbl.TableHead>
                )}
                {visibleColumns.has('outcome') && (
                  <Tbl.TableHead className="cursor-pointer" onClick={() => requestSort('outcome')}>
                    <div className="flex items-center w-28">
                      Spent
                      {sortConfig?.key === 'outcome' ? (
                        sortConfig.direction === 'ascending' ? (
                          <ArrowUp className="ml-2 h-4 w-4 text-black" />
                        ) : (
                          <ArrowDown className="ml-2 h-4 w-4 text-black" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </Tbl.TableHead>
                )}
                {visibleColumns.has('currency') && (
                  <Tbl.TableHead className="cursor-pointer" onClick={() => requestSort('currency')}>
                    <div className="flex items-center w-24"></div>
                  </Tbl.TableHead>
                )}
                <Tbl.TableHead className="w-[120px]"></Tbl.TableHead>
              </Tbl.TableRow>
            </Tbl.TableHeader>
            <Tbl.TableBody>
              {sortedData.map((row: RowData) => {
                const isEditing = editingRows.has(row.id);
                const isSaved = !!row.uuid;
                const isEdited = changedFields[row.id]?.size > 0;
                const isNew = newRows.has(row.id);
                return (
                  <Tbl.TableRow
                    key={row.id}
                    className={`h-9 relative 
                      ${isEditing ? 'bg-sky-100 border-sky-100 border-x-4' : 'hover:bg-muted/50'}
                      ${!isEditing && (isEdited || isNew) ? 'border-x-4 border-yellow-300 rounded-bl-lg' : ''}
                    `}
                  >
                    {(Object.keys(row) as Array<keyof RowData>).map(
                      (key) =>
                        visibleColumns.has(key) && (
                          <Tbl.TableCell key={key} colSpan={1} className={cn('pl-1 pr-0 py-0', cellWidthMap[key])}>
                            {renderCell(row, key)}
                          </Tbl.TableCell>
                        )
                    )}
                    <Tbl.TableCell className="p-0">
                      <div className="h-full flex items-center justify-between px-2">
                        <div className="flex space-x-0.5">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleSave(row.id)}
                              >
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleCancel(row.id)}
                              >
                                <XIcon className="h-4 w-4 text-red-500" />
                              </Button>
                              {!isSaved && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleRemove(row.id)}
                                >
                                  <MinusCircle className="h-4 w-4 text-red-500" />
                                  {row.uuid}
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(row)}>
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              {mode === 'bulk' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleDuplicate(row)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => handleRemove(row.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                              {isSaved && !isEdited && mode === 'bulk' && (
                                <CheckCheck className="h-4 w-4 text-green-400 self-center" />
                              )}
                              {changedFields[row.id]?.size > 0 && isSaved && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleRevert(row.id)}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </Tbl.TableCell>
                  </Tbl.TableRow>
                );
              })}
            </Tbl.TableBody>
          </Tbl.Table>
        </div>
      </div>
      {rowToDelete && (
        <ConfirmDeleteForm
          row={rowToDelete}
          open={isOpenDeleteTransactions}
          handleRemoveCompleted={handleRemoveCompleted}
          handleClose={() => {
            setIsOpenDeleteTransactions(false);
            setRowToDelete(null);
          }}
        />
      )}
    </div>
  );
}
