import * as React from 'react'
import axios from 'axios'
import { useSWRConfig } from 'swr'
import { evaluate } from 'mathjs'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography
} from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridEventListener,
  GridFooter,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
  GridRowParams,
  GridToolbarContainer,
  MuiEvent,
  useGridApiContext
} from '@mui/x-data-grid'
import { randomId } from '@mui/x-data-grid-generator'
import { useAuth } from '@/context/auth'
import { useAccounts } from '@/hooks/accounts'
import { useCategories } from '@/hooks/categories'
import { useCurrencies } from '@/hooks/currencies'
import { useAvailableRates } from '@/hooks/rates'
import { useUsers } from '@/hooks/users'
import { Category, CategoryType } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
import { User } from '@/components/users/types'
import { getFormattedDate, MONTH_DAY_FORMAT } from '@/utils/dateUtils'
import { formatMoney } from '@/utils/numberUtils'
import {
  AccountComponent,
  AmountComponent,
  BudgetComponent,
  DateComponent
} from './components'

interface Types {
  url: string
  open: boolean
  handleClose: () => void
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
}


interface CategoryComponentTypes extends GridRenderEditCellParams {
  parentList: Category[]
}

interface KeyValue {
  [id: string]: string
}

interface SelectedItem {
  uuid: string
  name: string
}

const EditToolbar: React.FC<EditToolbarProps> = (props) => {
  const [user, setUser] = React.useState('')
  const [baseCurrency, setBaseCurrency] = React.useState<string>('')
  const { rows, setRows, rowModesModel, setRowModesModel, url } = props
  const { mutate } = useSWRConfig()
  const { user: authUser, isLoading: isAuthLoading } = useAuth()

  const {
    data: users,
    isLoading: isUsersLoading
  } = useUsers()

  const {
    data: currencies = []
  } = useCurrencies()

  React.useEffect(() => {
    if (!authUser || !users) return

    const _user = users.find((item: User) => item.username === authUser.username)
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

  const handleDuplicateClick = () => {
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
        // TODO: stop loading
      })
    })
  }

  const isEditMode: boolean = Object.values(rowModesModel).some(
    (value) => value.mode === GridRowModes.Edit
  )

  return (
    <GridToolbarContainer>
      <Grid container>
        <Grid item xs={6}>
          <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
            Add transaction
          </Button>
          <Button
            color="primary"
            disabled={rows.length === 0 || isEditMode}
            startIcon={<AddIcon />}
            onClick={handleDuplicateClick}
          >
            Duplicate last transaction
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="h5">Computed amount: {formatMoney(sumOverall)}</Typography>
        </Grid>
        <Grid item xs={2} align="right">
          <Button variant="contained" onClick={handleSaveClick} disabled={isEditMode}>
            Save All
          </Button>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  )
}

const FooterWithError: React.FC = (props) => {
  const { errors } = props
  return (
    <Box>
      <Typography variant="h6">{errors}</Typography>
    </Box>
  )
}

const CategoryComponent: React.FC<CategoryComponentTypes> = (params) => {
  const { id, field, value, categories } = params
  const apiRef = useGridApiContext()

  const parents = categories.filter(
    (category: Category) => (
      category.parent === null && category.type === CategoryType.Expense
    )
  )

  const getChildren = (uuid: string): Category[] => {
    return categories.filter(
      (item: Category) => item.parent === uuid
    ) || []
  }

  const handleChange = (event: SelectChangeEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value })
  }

  return (
    <FormControl fullWidth>
      <Select
        fullWidth
        value={value}
        onChange={handleChange}
      >
        {parents.map((item: Category) => {
          return getChildren(item.uuid).map((subitem: Category) => (
            <MenuItem key={subitem.uuid} value={subitem}>{item.name} - {subitem.name}</MenuItem>
          ))
        })}
      </Select>
    </FormControl>
  )
}

const CurrencyComponent: React.FC<any> = (params) => {
  const { id, field, row, value } = params
  const apiRef = useGridApiContext()
  const date = getFormattedDate(row.transactionDate || new Date())

  const {
    data: currencies = []
  } = useCurrencies()

  const {
    data: availableRates = {}
  } = useAvailableRates(date)

  React.useEffect(() => {
    if (!currencies) return

    const defaultCurrency = currencies.find((item: Currency) => item.isDefault)
    const baseCurrency = currencies.find((item: Currency) => item.isBase)
    const newValue = availableRates[defaultCurrency?.code] ? defaultCurrency : baseCurrency

    apiRef.current.setEditCellValue({ id, field, value: newValue || '' })
  }, [availableRates, currencies])

  const handleChange = (event: SelectChangeEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value })
  }

  return (
    <FormControl fullWidth>
      <Select
        fullWidth
        value={value}
        onChange={handleChange}
      >
        {currencies.map((item: Currency) => (
          !!availableRates[item.code]
            ? <MenuItem key={item.uuid} value={item}>{item.sign} {item.verbalName}</MenuItem>
            : <MenuItem
              key={item.uuid}
              value={item}
              disabled
            >
              {item.sign} {item.verbalName} (unavailable)
            </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

const emptyRow = {
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

const AddForm: React.FC<Types> = ({ url, open, handleClose }) => {
  const [errors, setErrors] = React.useState<string>('')
  const {
    data: accounts = [],
    isLoading: isAccountsLoading
  } = useAccounts()

  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useCategories()

  const getTrimmedCategoryName = (uuid: string): string => {
    const categoryName = categories.find((item: Category) => item.uuid === uuid)?.name || ''
    if (categoryName.length > 7) {
      return categoryName.substring(0, 7) + '...'
    }
    return categoryName
  }

  const columns: GridColDef[] = [
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 150,
      editable: true,
      renderCell: (params) => params.formattedValue
        ? getFormattedDate(params.formattedValue, MONTH_DAY_FORMAT)
        : null,
      renderEditCell: (params) => <DateComponent {...params} />
    },
    {
      field: 'account',
      headerName: 'Account',
      width: 150,
      editable: true,
      renderCell: (params) => params.formattedValue.title,
      renderEditCell: (params) => <AccountComponent {...params} accounts={accounts} />
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 250,
      editable: true,
      renderCell: (params) => `${getTrimmedCategoryName(params.formattedValue.parent)} - ${params.formattedValue.name || ''}`,
      renderEditCell: (params) => <CategoryComponent {...params} categories={categories} />
    },
    {
      field: 'budget',
      headerName: 'Budget',
      width: 200,
      editable: true,
      renderCell: (params) => params.formattedValue.title,
      renderEditCell: (params) => <BudgetComponent {...params} />
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 80,
      editable: true,
      renderEditCell: (params) => <AmountComponent {...params} />
    },
    {
      field: 'currency',
      headerName: 'Currency',
      editable: true,
      renderCell: (params) => params.formattedValue.code,
      renderEditCell: (params) => <CurrencyComponent {...params} />
    },
    { field: 'description', headerName: 'Description', width: 100, editable: true },
    {
      field: 'baseAmount',
      headerName: 'Base Amount',
      width: 70,
      editable: false,
    },
    {
      field: 'saved',
      headerName: '',
      width: 20,
      editable: false,
      renderCell: (params) => params.formattedValue
        ? <CheckCircleIcon />
        : <DeleteIcon onClick={() => handleDeleteClick(params)} />
    },
  ];

  const [rows, setRows] = React.useState<[]>([])
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});
  const [account, setAccount] = React.useState<KeyValue>({})
  const [budgetDate, setBudgetDate] = React.useState<Date>(new Date())

  React.useEffect(() => {
    setErrors('')
  }, [rows])

  const handleAccountChange = (id: GridRowId, e) => {
    setAccount({ ...account, [id]: e.target.value })
  }

  const handleCategoryChange = (e) => {
    setCategory(e.target.value)
  }

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)))
    return updatedRow
  }

  const handleDeleteClick = (params): void => {
    const { id } = params
    setRows((oldRows) => oldRows.filter((item) => item.id !== id))
  }

  const onClose = () => {
    const canClose = rows.every((item: any) => item.saved === true)
    if (canClose) {
      handleClose()
      setErrors('')
      setRows([])
      setRowModesModel({})
    } else {
      setErrors('You have unsaved records. Remove or save them.')
    }
  }

  return (
    <Dialog maxWidth="lg" fullWidth={true} open={open} onClose={onClose}>
      <DialogTitle>Add transactions</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ height: 700 }}>
          <Grid item xs={12}>
            <DataGrid
              editMode="row"
              rows={rows}
              columns={columns}
              rowModesModel={rowModesModel}
              onRowModesModelChange={(newModel) => setRowModesModel(newModel)}
              processRowUpdate={processRowUpdate}
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
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}

export default AddForm
