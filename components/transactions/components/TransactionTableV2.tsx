'use client'

import { AccountResponse } from '@/components/accounts/types'
import { Currency } from '@/components/currencies/types'
import { TransactionResponse } from '@/components/transactions/types'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User } from '@/components/users/types'
import { useAccounts } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useTransactions } from '@/hooks/transactions'
import { useUsers } from '@/hooks/users'
import { getFormattedDate } from '@/utils/dateUtils'
import { format } from "date-fns"
import {
  ArrowUpDown,
  CalendarIcon,
  CheckCheck,
  CheckIcon,
  Copy,
  CreditCardIcon,
  MinusCircle,
  PencilIcon,
  PlusCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useStore } from '@/app/store'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import AccountComponent from '../forms/components/AccountComponentV2'
import BudgetComponent from '../forms/components/BudgetComponentV2'
import CategoryComponent from '../forms/components/CategoryComponentV2'
import DateComponent from '../forms/components/DateComponentV2'

interface Types {
  transactionDate: Date
}

export type RowData = {
  id: number
  uuid?: string | undefined
  date: Date
  account: string
  budget: string | null
  budgetName: string
  category: string
  categoryName: string
  categoryParentName: string
  outcome: number
  currency: string
  inBase: number
}

const excludedColumns = ['id', 'uuid', 'inBase', 'budgetName', 'categoryName', 'categoryParentName'];




export default function FinanceTable({ transactionDate }: Types) {
  const [data, setData] = useState<RowData[]>([])
  const [user, setUser] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set())
  const [editedRows, setEditedRows] = useState<{ [key: number]: RowData }>({})
  const [snapshots, setSnapshots] = useState<RowData[][]>([])
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [changedFields, setChangedFields] = useState<{ [key: number]: Set<keyof RowData> }>({})
  const [nextId, setNextId] = useState<number>(0)
  const [invalidFields, setInvalidFields] = useState<{ [key: number]: Set<keyof RowData> }>({})
  const currencyInputRef = useRef<HTMLInputElement>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof RowData; direction: 'ascending' | 'descending' } | null>(null)
  const [newRows, setNewRows] = useState<Set<number>>(new Set())

  const { data: { user: authUser } } = useSession()
  const { data: users = [] } = useUsers()
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const {
    data: transactions = [],
    url: transactionsUrl
  } = useTransactions({
    sorting: 'added',
    limit: 500,
    dateFrom: getFormattedDate(transactionDate),
    dateTo: getFormattedDate(transactionDate)
  })

  const currencySign = useStore((state) => state.currencySign)
  const baseCurrency = currencies.find((item: Currency) => item.isBase)
  const defaultCurrency = currencies.find((item: Currency) => item.isDefault) || baseCurrency

  React.useEffect(() => {
    if (!authUser || (users.length === 0)) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  React.useEffect(() => {
    resetEditing()
    const validatedData: RowData[] = transactions.map((item: TransactionResponse, index: number) => ({
      id: index,
      uuid: item.uuid,
      date: new Date(item.transactionDate),
      account: item.account,
      budget: item.budget,
      budgetName: item.budgetDetails.title,
      category: item.category,
      categoryName: item.categoryDetails.name,
      categoryParentName: item.categoryDetails.parentName,
      outcome: item.spentInCurrencies[authUser.currency],
      currency: item.currency,
      inBase: item.spentInCurrencies[baseCurrency?.code]
    }))
    setData(validatedData)
    setNextId(transactions.length)
    setSnapshots([validatedData])
  }, [transactions])

  const resetEditing = () => {
    setEditingRows(new Set())
    setEditedRows({})
    setSnapshots([])
    setCurrentSnapshotIndex(0)
    setChangedFields({})
    setInvalidFields({})
    setNewRows(new Set())
  }

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: keyof RowData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleEdit = (row: RowData) => {
    setEditingRows(prev => new Set(prev).add(row.id))
    setEditedRows(prev => ({ ...prev, [row.id]: { ...row } }))
  }

  const handleSave = (id: number) => {
    const rowToSave = editedRows[id]
    const invalidFieldsForRow = new Set<keyof RowData>()

    if (!rowToSave.date) invalidFieldsForRow.add('date')
    if (!rowToSave.account) invalidFieldsForRow.add('account')
    if (!rowToSave.budget) invalidFieldsForRow.add('budget')
    if (!rowToSave.category) invalidFieldsForRow.add('category')
    if (!rowToSave.outcome) invalidFieldsForRow.add('outcome')
    if (!rowToSave.currency) invalidFieldsForRow.add('currency')

    if (invalidFieldsForRow.size > 0) {
      setInvalidFields(prev => ({ ...prev, [id]: invalidFieldsForRow }))
      return
    }

    setEditingRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })

    setData(prevData => {
      const newData = prevData.map(row => row.id === id ? rowToSave : row)
      const changedKeys = Object.keys(rowToSave).filter(key =>
        JSON.stringify(rowToSave[key as keyof RowData]) !==
        JSON.stringify(snapshots[currentSnapshotIndex]?.find(r => r.id === id)?.[key as keyof RowData])
      ) as Array<keyof RowData>

      setChangedFields(prev => ({
        ...prev,
        [id]: new Set(changedKeys)
      }))

      setIsSubmitted(false)
      setInvalidFields(prev => {
        const newInvalidFields = { ...prev }
        delete newInvalidFields[id]
        return newInvalidFields
      })
      return newData
    })
    setNewRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleRevert = (id: number) => {
    const originalRow = snapshots[currentSnapshotIndex].find(row => row.id === id)
    if (originalRow) {
      setData(prevData => prevData.map(row => row.id === id ? originalRow : row))
      setChangedFields(prev => ({
        ...prev,
        [id]: new Set()
      }))
    }
  }

  const handleChange = (id: number, field: keyof RowData, value: any) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }))
    setInvalidFields(prev => {
      const newInvalidFields = { ...prev }
      if (newInvalidFields[id]) {
        newInvalidFields[id].delete(field)
        if (newInvalidFields[id].size === 0) {
          delete newInvalidFields[id]
        }
      }
      return newInvalidFields
    })
  }

  const createSnapshot = useCallback(() => {
    setSnapshots(prev => [...prev.slice(0, currentSnapshotIndex + 1), data])
    setCurrentSnapshotIndex(prev => prev + 1)
    setChangedFields(
      data.reduce((acc, row) => ({ ...acc, [row.id]: new Set() }), {})
    )
    setIsSubmitted(true)
    setNewRows(new Set())
  }, [data, currentSnapshotIndex])

  const handleSubmit = () => {
    createSnapshot()
  }

  const handleDateChange = (id: number, newDate: Date) => {
    handleChange(id, 'date', newDate)
  }

  const handleAddNewTransaction = () => {
    const newRow: RowData = {
      id: nextId,
      date: new Date(),
      account: '',
      budget: '',
      budgetName: '',
      category: '',
      categoryName: '',
      categoryParentName: '',
      outcome: 0,
      currency: defaultCurrency?.uuid,
      inBase: 0
    }
    setData(prevData => [...prevData, newRow])
    setEditingRows(prev => new Set(prev).add(nextId))
    setEditedRows(prev => ({ ...prev, [nextId]: newRow }))
    setChangedFields(prev => ({ ...prev, [nextId]: new Set() }))
    setNextId(prev => prev + 1)
    setIsSubmitted(false)
    setNewRows(prev => new Set(prev).add(nextId))
  }

  const handleDuplicate = (row: RowData) => {
    const newRow: RowData = { ...row, id: nextId }
    setData(prevData => [...prevData, newRow])
    setEditingRows(prev => new Set(prev).add(nextId))
    setEditedRows(prev => ({ ...prev, [nextId]: newRow }))
    setChangedFields(prev => ({ ...prev, [nextId]: new Set() }))
    setNextId(prev => prev + 1)
    setIsSubmitted(false)
    setNewRows(prev => new Set(prev).add(nextId))

    setTimeout(() => {
      if (currencyInputRef.current) {
        currencyInputRef.current.focus()
        currencyInputRef.current.select()
      }
    }, 0)
  }

  const handleRemove = (id: number) => {
    setData(prevData => prevData.filter(row => row.id !== id))
    setEditingRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
    setEditedRows(prev => {
      const newEditedRows = { ...prev }
      delete newEditedRows[id]
      return newEditedRows
    })
    setChangedFields(prev => {
      const newChangedFields = { ...prev }
      delete newChangedFields[id]
      return newChangedFields
    })
    setInvalidFields(prev => {
      const newInvalidFields = { ...prev }
      delete newInvalidFields[id]
      return newInvalidFields
    })
    setNewRows(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave(id)
    }
  }

  const renderCell = (row: RowData, key: keyof RowData) => {
    const isEditing = editingRows.has(row.id)
    const value = isEditing ? editedRows[row.id][key] : row[key]
    const isChanged = changedFields[row.id]?.has(key)
    const isSaved = snapshots[currentSnapshotIndex]?.some(r => r.id === row.id)
    const isInvalid = invalidFields[row.id]?.has(key)
    const isNew = newRows.has(row.id)
    const editedRow = editedRows[row.id]

    const cellStyle = isEditing || isChanged || isNew ? 'text-blue-400' : ''
    const inputStyle = `w-full h-8 px-2 text-sm border-0 focus:ring-0 focus:outline-none focus:border-primary bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-blue-700 ${isInvalid ? 'outline outline-red-400' : ''}`

    if (!isEditing) {
      switch (key) {
        case 'date':
          return (
            <div className="px-1 flex items-center justify-center">
              <Badge variant="outline" className={`text-xs font-medium ${cellStyle}`}>
                {format(value as Date, 'dd MMM yyyy')}
              </Badge>
            </div >
          )
        case 'account':
          return (
            <div className={`px-1 flex items-center ${cellStyle}`}>
              <CreditCardIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{accounts.find((item: AccountResponse) => item.uuid === value)?.title}</span>
            </div>
          )
        case 'budget':
          return <Badge variant="outline" className={`px-2 ${cellStyle} truncate`}>{row.budgetName}</Badge>
        case 'category':
          return (
            <div className={`px-1 py-1 flex items-center ${cellStyle}`}>
              <span className="font-medium truncate">{row.categoryParentName}</span>
              <span className="mx-1">/</span>
              <span className="text-muted-foreground truncate">{row.categoryName}</span>
            </div>
          )
        case 'outcome':
          return (
            <div className={`flex flex-col justify-between px-2 text-right ${cellStyle}`}>
              <div className="flex">
                <span className="font-semibold mr-1">{Number(value).toFixed(2)}</span><span>{currencySign}</span>
              </div>
              {isSaved && !isChanged && (
                <span className="ml-2 text-muted-foreground text-[0.6rem]">({Number(row.inBase).toFixed(2)} {baseCurrency?.sign})</span>
              )}
            </div>
          )
        case 'currency':
          return
      }
    }

    const commonInputClass = `w-full h-8 px-2 text-sm border-0 focus:ring-2 focus:border-primary ${inputStyle}`

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
        )
      case 'account':
        return <AccountComponent
          value={value as string}
          user={user}
          accounts={accounts}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          row={editedRow}
          isInvalid={isInvalid}
        />
      case 'budget':
        return <BudgetComponent
          user={user}
          value={value as string}
          accounts={accounts}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          row={editedRow}
          isInvalid={isInvalid}
        />
      case 'category':
        return <CategoryComponent
          user={user}
          value={value as string}
          categories={categories}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          row={editedRow}
          isInvalid={isInvalid}
        />
      case 'currency':
        return (
          <Select
            value={value as string}
            onValueChange={(value) => handleChange(row.id, key, value)}
            onOpenChange={(open) => {
              if (!open) {
                (document.activeElement as HTMLElement)?.blur();
              }
            }}
          >
            <SelectTrigger
              className={`${commonInputClass} text-left`}
              onKeyDown={(e) => handleKeyDown(e, row.id)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((item: Currency) => (
                <SelectItem key={item.uuid} value={item.uuid}>
                  {item.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'outcome':
        return (
          <div className="flex items-center h-8">
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => handleChange(row.id, key, parseFloat(e.target.value))}
              onKeyDown={(e) => handleKeyDown(e, row.id)}
              className={`${commonInputClass} text-right`}
              ref={row.id === nextId - 1 ? currencyInputRef : null}
            />
            <span className="ml-1">{currencies.find((item: Currency) => item.uuid === editedRows[row.id].currency)?.sign}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddNewTransaction}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Transaction
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitted || Object.values(changedFields).every(set => set.size === 0) || editingRows.size > 0}
          >
            Submit Changes
          </Button>
          {/* TODO: move this to bulk add component */}
          {isSubmitted && <CheckCheck className="text-green-500" />}
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="flex cursor-pointer" onClick={() => requestSort('date')}>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('account')}>
                  <div className="flex items-center">
                    Account
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('budget')}>
                  <div className="flex items-center">
                    Budget
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>
                  <div className="flex items-center">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('outcome')}>
                  <div className="flex items-center">
                    Spent
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('currency')}>
                  <div className="flex items-center">
                  </div>
                </TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row: RowData) => {
                const isEditing = editingRows.has(row.id)
                const isSaved = snapshots[currentSnapshotIndex]?.some(r => r.id === row.id)
                const isEdited = changedFields[row.id]?.size > 0
                const isNew = newRows.has(row.id)
                return (
                  <TableRow
                    key={row.id}
                    className={`h-9 relative 
                      ${isEditing ? 'bg-sky-100 border-sky-100 border-x-4' : 'hover:bg-muted/50'}
                      ${!isEditing && (isEdited || isNew) ? 'border-x-4 border-blue-300 rounded-bl-lg' : ''}
                    `}
                  >
                    {(Object.keys(row) as Array<keyof RowData>).filter(key => !excludedColumns.includes(key)).map(key => (
                      <TableCell key={key} className="pl-1 pr-0 py-0">
                        {renderCell(row, key)}
                      </TableCell>
                    ))}<TableCell className="p-0">
                      <div className="h-full flex items-center justify-between px-2">
                        <div className="flex space-x-0.5">
                          {isEditing ? (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleSave(row.id)}>
                                <CheckIcon className="h-4 w-4" />
                              </Button>
                              {!isSaved && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRemove(row.id)}>
                                  <MinusCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(row)}>
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDuplicate(row)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              {changedFields[row.id]?.size > 0 && isSaved && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRevert(row.id)}>
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              )}
                              {!isSaved && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleRemove(row.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                        {isSaved && !isEdited && <CheckCheck className="text-green-500 h-4 w-4" />}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div >
    </div >
  )
}
