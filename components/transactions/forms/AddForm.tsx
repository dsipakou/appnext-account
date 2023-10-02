import * as React from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { evaluate } from 'mathjs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  GridRenderCellParams,
} from '@mui/x-data-grid'
import { randomId } from '@mui/x-data-grid-generator'
import { useAccounts } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useUsers } from '@/hooks/users'
import { Currency } from '@/components/currencies/types'
import { User } from '@/components/users/types'
import { getFormattedDate } from '@/utils/dateUtils'
import { formatMoney } from '@/utils/numberUtils'
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
  DescriptionComponent,
} from './components'

interface Types {
  open: boolean
  onOpenChange: () => void
  url: string
  budget?: string
}

interface EditToolbarProps {
  rows: GridRowsProp,
  setRows: (
    newRows: (oldRows: GridRowsProp) => GridRowsProp
  ) => void
  rowModesModel: GridRowModesModel,
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void
  url: string
}

const EditToolbar: React.FC<EditToolbarProps> = (props) => {
  const [user, setUser] = React.useState('')
  const [baseCurrency, setBaseCurrency] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { rows, setRows, rowModesModel, setRowModesModel, url } = props
  const { mutate } = useSWRConfig()
  const { data: { user: authUser } } = useSession()

  const { data: users = [] } = useUsers()

  const { data: currencies = [] } = useCurrencies()

  React.useEffect(() => {
    if (!authUser || !users.length) return

    const _user = users.find((item: User) => item.username === authUser.username)!
    setUser(_user.uuid)
  }, [authUser, users])

  React.useEffect(() => {
    setBaseCurrency(currencies.find((item: Currency) => item.isBase)?.code)
  })

  const id = randomId()

  const sumOverall: number = rows.reduce((acc: number, item: any) => {
    return acc + parseFloat(item.amount.replace(',', '.')) || 0
  }, 0)

  const handleClick = () => {
    setRows((oldRows) => [...oldRows, { ...emptyRow, id }])
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' },
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
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' },
    }))
  }

  const handleSaveClick = (): void => {
    setIsLoading(true)
    rows.forEach((row: any) => {
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
        type: "outcome",
        user: user
      }

      axios.post('transactions/', {
        ...payload,
      }).then(
        res => {
          if (res.status === 201) {
            setRows((oldRows) => oldRows.map(
              (item) => item.id === row.id
                ? {
                  ...item,
                  saved: true,
                  baseAmount: formatMoney(res.data.spentInCurrencies[baseCurrency])
                }
                : item
            ))
            mutate(url)
          }
        }
      ).catch(
        (error) => {
          const errRes = error.response.data
          for (const prop in errRes) {
            // TODO: Set errors
          }
        }
      ).finally(() => {
          setIsLoading(false)
      })
    })
  }

  const isEditMode: boolean = Object.values(rowModesModel).some(
    (value) => value.mode === GridRowModes.Edit
  )

  const isListEmpty: boolean = rows.length === 0

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
        <div className="flex justify-end items-center">
          <Button onClick={handleSaveClick} className="h-7" disabled={isLoading || isEditMode || isListEmpty}>
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

let emptyRow = {
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
  saved: false
}

const AddForm: React.FC<Types> = ({ open, onOpenChange, url, budget }) => {
  const [errors, setErrors] = React.useState<string>('')
  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()

  const { toast } = useToast()

  const baseCurrencyCode = currencies.find((item: Currency) => item.isBase)?.code || ''

  if (budget) {
    console.log(budget)
    emptyRow = {...emptyRow, budget }
  } else {
    emptyRow = {...emptyRow, budget: '' }
  }

  const columns: GridColDef[] = [
    {
      field: 'transactionDate',
      headerName: 'Date',
      flex: 0.8,
      editable: true,
      renderCell: (params: GridRenderCellParams<Date>) => <DateReadComponent {...params} />,
      renderEditCell: (params) => <DateComponent {...params} />,
    },
    {
      field: 'account',
      headerName: 'Account',
      flex: 0.7,
      editable: true,
      renderCell: (params: GridRenderCellParams<Account>) => <AccountReadComponent {...params} />,
      renderEditCell: (params) => <AccountComponent {...params} accounts={accounts} />
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
      field: 'budget',
      headerName: 'Budget',
      flex: 0.8,
      editable: true,
      renderCell: (params) => <BudgetReadComponent {...params} />,
      renderEditCell: (params) => <BudgetComponent {...params} />,
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
      renderCell: (params) => <BaseAmountReadComponent {...params} rowModesModel={rowModesModel} />,
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
        handleSaveClick={handleSaveClick}
        handleDeleteClick={handleDeleteClick}
        handleDuplicateClick={handleDuplicateClick}
      />,
    },
  ];

  const [rows, setRows] = React.useState<[]>([])
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

  React.useEffect(() => {
    setErrors('')
  }, [rows])

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
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
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'amount' },
    }))
  }

  const onClose = (open: boolean) => {
    if (open) {
      onOpenChange(open)
      return
    }

    const canClose = rows.every((item: any) => item.saved === true)
    if (canClose) {
      setErrors('');
      setRows([ ]);
      setRowModesModel({ });
      onOpenChange(false);
    } else {
      toast({
        title: "You have unsubmitted transactions",
        variant: "warning",
        description: "Please, remove or submit them",
      })
    }
  }

  const handleEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditStart = (params, event) => {
    if (params.row.saved) {
      event.defaultMuiPrevented = true
    }
  }

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
              '& .MuiDataGrid-cell.MuiDataGrid-cell--editable': {
                padding: 0,
              },
              '& .MuiDataGrid-cell': {
                padding: 0,
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
