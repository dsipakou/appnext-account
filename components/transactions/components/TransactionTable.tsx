import * as React from 'react'
import {
  GridActionsCellItem
} from '@mui/x-data-grid'
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useAuth } from '@/context/auth'
import { TransactionResponse } from '@/components/transactions/types'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  transactions: any
  handleDeleteClick: (uuid: string) => void
}

const TransactionTable: React.FC<Types> = ({ transactions, handleDeleteClick }) => {
  const [rows, setRows] = React.useState<GridRowsProp>([])
  const columns: GridColDef[] = [
    { field: 'account', headerName: 'Account', width: 150 },
    { field: 'category', headerName: 'Category', width: 250 },
    { field: 'budget', headerName: 'Budget', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 80 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: ({ row }) => {
        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(row.uuid)}
            color="inherit"
          />
        ]
      }
    }
  ]

  const { user } = useAuth()

  React.useEffect(() => {
    if (!transactions) return

    setRows(transactions.map(
      (item: TransactionResponse, index: number) => (
        {
          id: index + 1,
          uuid: item.uuid,
          amount: formatMoney(item.spentInCurrencies[user?.currency]),
          category: item.categoryDetails.name,
          account: item.accountDetails.title,
          budget: item.budgetDetails?.title || '',
        }
      )
    ))
  }, [transactions])

  return (
    <div style={{ height: 1000, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  )
}

export default TransactionTable
