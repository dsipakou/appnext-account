import * as React from 'react'
import { useSession } from 'next-auth/react'
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridActionsCellItem,
  GridRenderCellParams
} from '@mui/x-data-grid'
import { Pen, Trash2 } from 'lucide-react'
import { Category } from '@/components/categories/types'
import { Currency } from '@/components/currencies/types'
import { BudgetSlim } from '@/components/budget/types'
import { formatMoney } from '@/utils/numberUtils'
import { parseDate } from '@/utils/dateUtils'
import { AccountResponse } from '@/components/accounts/types'
import { useAccounts } from '@/hooks/accounts'
import { useCurrencies } from '@/hooks/currencies'
import { useCategories } from '@/hooks/categories'
import { TransactionResponse } from '@/components/transactions/types'
import {
  AccountReadComponent,
  AmountReadComponent,
  BudgetReadComponent,
  CategoryReadComponent,
  DateReadComponent,
  MainCurrencyAmountReadComponent,
} from '../forms/components'

interface Types {
  transactions: TransactionResponse[]
  withDate?: boolean
  showBudget?: boolean
  handleDeleteClick: (uuid: string) => void
  handleEditClick: (uuid: string) => void
}

const TransactionTable: React.FC<Types> = ({ transactions = [], withDate, showBudget = true, handleDeleteClick, handleEditClick }) => {
  const [rows, setRows] = React.useState<GridRowsProp>([])
  const [page, setPage] = React.useState<number>(1)

  const { data: accounts = [] } = useAccounts()
  const { data: categories = [] } = useCategories()
  const { data: currencies = [] } = useCurrencies()
  const { data: { user } } = useSession()

  const getAccount = (uuid: string): AccountResponse | undefined => {
    return accounts.find((item: AccountResponse) => item.uuid === uuid)
  }

  const getCategory = (uuid: string): Category | undefined => {
    return categories.find((item: Category) => item.uuid === uuid)
  }

  const getCurrency = (code: string): Currency | undefined => {
    return currencies.find((item: Currency) => item.code === code)
  }

  const baseCurrency = currencies.find((item: Currency) => item.isBase)

  const columns: GridColDef[] = [
    {
      field: 'transactionDate',
      headerName: 'Date',
      flex: 0.5,
      renderCell: (params) => <DateReadComponent {...params} />
    },
    {
      field: 'account',
      headerName: 'Account',
      flex: 0.7,
      renderCell: (params: GridRenderCellParams<AccountResponse>) => <AccountReadComponent {...params} />
    },
    {
      field: 'budget',
      headerName: 'Budget',
      flex: 0.6,
      renderCell: (params: GridRenderCellParams<BudgetSlim>) => <BudgetReadComponent {...params} />
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1.5,
      renderCell: (params) => <CategoryReadComponent {...params} />
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      flex: 0.4,
      renderCell: (params) => <AmountReadComponent {...params} currency={getCurrency(user?.currency)} />
    },
    {
      field: 'baseAmount',
      headerName: '',
      type: 'number',
      flex: 0.4,
      renderCell: (params) => <MainCurrencyAmountReadComponent {...params} currency={baseCurrency} />
    },
    {
      field: 'currency',
    },
    {
      field: 'actions',
      type: 'actions',
      flex: 0.4,
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<Pen className="w-4 h-4" />}
            label="Edit"
            onClick={() => handleEditClick(row.uuid)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            onClick={() => handleDeleteClick(row.uuid)}
            color="inherit"
          />
        ]
      }
    }
  ]

  React.useEffect(() => {
    if ((accounts.length === 0) || (categories.length === 0)) return

    setRows(transactions.map(
      (item: TransactionResponse, index: number) => (
        {
          id: index + 1,
          uuid: item.uuid,
          transactionDate: parseDate(item.transactionDate),
          amount: formatMoney(item.spentInCurrencies[user?.currency]),
          baseAmount: formatMoney(item.spentInCurrencies[baseCurrency?.code]),
          category: getCategory(item.category),
          account: getAccount(item.account),
          currency: getCurrency(user?.currency),
          budget: item.budgetDetails
        }
      )
    ))
  }, [transactions])

  const hiddenColumns = {
    currency: false,
    transactionDate: !!withDate,
    budget: !!showBudget,
    baseAmount: baseCurrency?.code !== getCurrency(user?.currency)?.code
  }

  const changePage = (page: number) => {
    console.log(page)
    setPage(page)
  }

  return (
    <div className="flex w-full h-screen">
      <DataGrid
        sx={{
          ["& .MuiDataGrid-cell.MuiDataGrid-cell--editing:focus-within"]: {
            outline: "none !important",
          },
          ["& .MuiDataGrid-cell.MuiDataGrid-cell--editing:focus-within"]: {
            outline: "none !important",
          },
        }}
        rows={rows}
        columns={columns}
        rowHeight={40}
        columnVisibilityModel={{
          ...hiddenColumns
        }}
        page={page}
        onPageChange={changePage}
      />
    </div>
  )
}

export default TransactionTable
