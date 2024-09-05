import * as React from 'react'
import { useSession } from 'next-auth/react'
import { useSWRConfig } from 'swr'
import { evaluate } from 'mathjs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridToolbarContainer,
  GridRowEditStopReasons,
  GridRenderCellParams
} from '@mui/x-data-grid'
import { randomId } from '@mui/x-data-grid-generator'
import { useAccounts } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useCreateTransaction } from '@/hooks/transactions'
import { useUsers } from '@/hooks/users'
import { User } from '@/components/users/types'
import { getFormattedDate, parseDate } from '@/utils/dateUtils'
import { formatMoney } from '@/utils/numberUtils'
import { Account, AccountResponse } from '@/components/accounts/types'
import { Currency } from '@/componnents/currencies/types'
import {
  AccountComponent,
  AccountReadComponent,
  ActionsReadComponent,
  AmountComponent,
  AmountReadComponent,
  BaseAmountReadComponent,
  BudgetComponent,
  BudgetReadComponent,
  CategoryComponent,
  CategoryReadComponent,
  CurrencyComponent,
  DateComponent,
  DateReadComponent,
  DescriptionComponent
} from './components'
import { CompactWeekItem } from '@/components/budget/types'

interface Types {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  budget?: CompactWeekItem
}

interface EditToolbarProps {
  rows: GridRowsProp
  setRows: (
    newRows: (oldRows: GridRowsProp) => GridRowsProp
  ) => void
  rowModesModel: GridRowModesModel
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void
  url: string
}

const EditToolbar: React.FC<EditToolbarProps> = (props) => {
  const [user, setUser] = React.useState('')
  const [baseCurrency, setBaseCurrency] = React.useState<string>('')
  const { rows, setRows, rowModesModel, setRowModesModel, url } = props
  const { mutate } = useSWRConfig()
  const { data: { user: authUser } } = useSession()
  const { toast } = useToast()

  const { data: accounts = [] } = useAccounts()
  const { data: users = [] } = useUsers()
  const { data: currencies = [] } = useCurrencies()
  const { trigger: createTransaction, isMutating: isCreating } = useCreateTransaction()

  React.useEffect(() => {
    if (!authUser || (users.length === 0)) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  const getDefaultAccountForCurrentUser = (): AccountResponse | undefined => {
    if (user) {
      return accounts.find((item: Account) => item.user === user && item.isMain)
    }
    return undefined
  }

  React.useEffect(() => {
    setBaseCurrency(currencies.find((item: Currency) => item.isBase)?.code)
  })

  const id = randomId()

  const sumOverall: number = rows.reduce((acc: number, item: any) => {
    return acc + parseFloat(item.amount.replace(',', '.')) || 0
  }, 0)

  const handleClick = () => {
    setRows((oldRows) => [...oldRows, { ...emptyRowTemplate, id }])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' }
    }))
  }

  const handleDuplicateLastClick = () => {
    setRows((oldRows) => [...oldRows, {
      ...oldRows.slice(-1)[0],
      id,
      saved: false,
      baseAmount: ''
    }])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' }
    }))
  }

  const handleClearClick = (): void => {
    setRows([])
    setRowModesModel({})
  }

  const handleSaveClick = (): void => {
    rows.forEach(async (row: any) => {
      if (row.saved) {
        return
      }

      const payload = {
        account: row.account.uuid,
        amount: String(evaluate(row.amount.replace(',', '.'))),
        budget: row.budget.uuid,
        category: row.category.uuid,
        currency: row.currency.uuid,
        description: row.description,
        transactionDate: getFormattedDate(row.transactionDate),
        type: 'outcome',
        user
      }

      try {
        const res = await createTransaction(payload)
        setRows((oldRows) => oldRows.map(
          (item) => item.id === row.id
            ? {
              ...item,
              saved: true,
              baseAmount: formatMoney(res?.spentInCurrencies[baseCurrency])
            }
            : item
        ))
        mutate(url)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Something went wrong'
        })
      }
    })
  }

  const isEditMode: boolean = Object.values(rowModesModel).some(
    (value) => value.mode === GridRowModes.Edit
  )

  const isListEmpty: boolean = rows.length === 0

  const isAllSaved: boolean = rows.every((row) => row.saved)

  return (
    <GridToolbarContainer>
      <div className="grid grid-cols-3 w-full p-1 rounded-md bg-white">
        <div className="flex gap-2 items-center">
          <Button
            variant="default"
            className="h-7"
            onClick={handleClick}
          >
            Add transaction
          </Button>
          <Button
            variant="secondary"
            className="h-7"
            disabled={rows.length === 0 || isEditMode}
            onClick={handleDuplicateLastClick}
          >
            Duplicate last transaction
          </Button>
        </div>
        <div className="flex justify-center">
          <span className="text-xl font-semibold">Transactions outcome: {formatMoney(sumOverall)}</span>
        </div>
        <div className="flex justify-end items-center gap-2">
          <Button variant="destructive" onClick={handleClearClick} className="h-7" disabled={isCreating || isEditMode || isListEmpty}>
            Clear list
          </Button>
          <Button onClick={handleSaveClick} className="h-7" disabled={isCreating || isEditMode || isListEmpty || isAllSaved}>
            Submit transactions
          </Button>
        </div>
      </div>
    </GridToolbarContainer>
  )
}

const FooterWithError: React.FC = (props) => {
  const { errors } = props
  return (
    <div className="flex w-full justify-center items-center">
      <span>{errors}</span>
    </div>
  )
}

const emptyRowTemplate = {
  account: '',
  category: '',
  budget: '',
  amount: '',
  currency: '',
  description: '',
  transactionDate: '',
  type: '',
  user: '',
  baseAmount: '',
  saved: false,
  edited: false,
}

let emptyRow = emptyRowTemplate

const AddForm: React.FC<Types> = ({ open, onOpenChange, url, budget }) => {
  const [user, setUser] = React.useState('')
  const [errors, setErrors] = React.useState<string>('')
  const [accountForBudget, setAccountForBudget] = React.useState<Account | undefined>(undefined)
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { data: users = [] } = useUsers()

  const { data: { user: authUser } } = useSession()
  const { toast } = useToast()

  const baseCurrencyCode = currencies.find((item: Currency) => item.isBase)?.code || ''

  React.useEffect(() => {
    if (!authUser || (users.length === 0)) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  React.useEffect(() => {
    if (!budget || !accounts.length) return

    const account = accounts.find((item: Account) => item.user === budget.user && item.isMain)
    if (account) {
      setAccountForBudget(account)
    }
  }, [budget, accounts])

  const columns: GridColDef[] = [
    {
      field: 'transactionDate',
      headerName: 'Date',
      flex: 0.8,
      editable: true,
      renderCell: (params: GridRenderCellParams<Date>) => <DateReadComponent {...params} />,
      renderEditCell: (params) => <DateComponent {...params} />
    },
    {
      field: 'account',
      headerName: 'Account',
      flex: 0.7,
      editable: true,
      renderCell: (params: GridRenderCellParams<Account>) => <AccountReadComponent {...params} />,
      renderEditCell: (params) => <AccountComponent {...params} user={user} />
    },
    {
      field: 'budget',
      headerName: 'Budget',
      flex: 0.8,
      editable: true,
      renderCell: (params) => <BudgetReadComponent {...params} />,
      renderEditCell: (params) => <BudgetComponent {...params} />
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1.2,
      editable: true,
      renderCell: (params) => <CategoryReadComponent {...params} />,
      renderEditCell: (params) => <CategoryComponent {...params} categories={categories} />
    },
    {
      field: 'amount',
      headerName: 'Outcome',
      flex: 0.5,
      editable: true,
      minWidth: 100,
      renderCell: (params) => <AmountReadComponent {...params} />,
      renderEditCell: (params) => <AmountComponent {...params} />
    },
    {
      field: 'currency',
      headerName: 'Currency',
      flex: 0.4,
      editable: true,
      renderCell: (params) => params.formattedValue.code,
      renderEditCell: (params) => <CurrencyComponent {...params} />
    },
    {
      field: 'description',
      flex: 1,
      headerName: 'Notes',
      width: 100,
      editable: true,
      renderEditCell: (params) => <DescriptionComponent {...params} />
    },
    {
      field: 'baseAmount',
      flex: 0.5,
      headerName: `In ${baseCurrencyCode}`,
      editable: false,
      renderCell: (params) => <BaseAmountReadComponent {...params} rowModesModel={rowModesModel} />
    },
    {
      field: 'saved',
      headerName: '',
      flex: 0.5,
      minWidth: 100,
      editable: false,
      renderCell: (params) => <ActionsReadComponent
        {...params}
        rowModesModel={rowModesModel}
        handleApplyChanges={handleApplyChanges}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
        handleDuplicateClick={handleDuplicateClick}
      />
    }
  ]

  const [rows, setRows] = React.useState<[]>([])
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({})

  React.useEffect(() => {
    const id = randomId()

    if (accountForBudget) {
      emptyRow = {
        ...emptyRow,
        id,
        account: accountForBudget,
        budget: budget.uuid,
        amount: String(budget.amount),
        currency: budget.currency,
        transactionDate: parseDate(budget.budgetDate),
      }
      setRows(() => [emptyRow])
      setRowModesModel(() => ({
        [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' }
      }))
    }
  }, [accountForBudget])

  React.useEffect(() => {
    setErrors('')
  }, [rows])

  const handleApplyChanges = (id: GridRowId) => () => {
    console.log('saving')
    console.log(rowModesModel)
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)))
    return updatedRow
  }

  const handleDeleteClick = (params): void => {
    const { id } = params
    setRows((oldRows) => oldRows.filter((item) => item.id !== id))
    setRowModesModel((oldModel) => {
      delete oldModel[id]
      return oldModel
    })
  }

  const id = randomId()

  const handleDuplicateClick = (params: GridRenderCellParams): void => {
    const rowToDuplicate = rows.find((item: GridRenderCellParams) => item.id === params.id)
    setRows((oldRows) => [...oldRows, {
      ...rowToDuplicate,
      id,
      saved: false,
      baseAmount: ''
    }])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' }
    }))
  }

  const onClose = (open: boolean) => {
    if (open) {
      onOpenChange(open)
      return
    }

    const canClose = rows.every((item: any) => item.saved === true)
    if (canClose) {
      setErrors('')
      setRows([])
      setRowModesModel({})
      onOpenChange(false)
    } else {
      toast({
        title: 'You have unsubmitted transactions',
        variant: 'warning',
        description: 'Please, remove or submit them'
      })
    }
  }

  const handleEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditStart = (params, event) => { }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
      </DialogTrigger>
      <DialogContent className="flex flex-col sm:max-w-full w-4/5 h-5/6 items-start mx-3">
        <DialogHeader>
          <DialogTitle>Add transactions</DialogTitle>
        </DialogHeader>
        <div className="flex h-full w-full">
          <DataGrid
            rowHeight={36}
            editMode="row"
            rows={rows}
            columns={columns}
            rowModesModel={rowModesModel}
            onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
            onRowEditStop={handleEditStop}
            onRowEditStart={handleEditStart}
            processRowUpdate={processRowUpdate}
            sx={{
              '& .MuiDataGrid-cell.MuiDataGrid-cell': {
                padding: 0,
                border: 0,
              },
              '& .MuiDataGrid-cell.MuiDataGrid-cell:focus-within': {
                padding: 0,
                border: 0,
                outline: 0,
              },
              '& .MuiDataGrid-cell': {
                padding: 0
              },
              '& :focus-visible, & :focus': {
                outline: 1,
                outlineOffset: -1,
              }
            }}
            components={{
              Toolbar: EditToolbar,
              Footer: FooterWithError
            }}
            componentsProps={{
              toolbar: { rows, setRows, rowModesModel, setRowModesModel, url },
              footer: { errors }
            }}
            experimentalFeatures={{ newEditingApi: true }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddForm
