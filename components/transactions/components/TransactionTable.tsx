import * as React from 'react'
import {
  Box
} from '@mui/material'
import {
  GridActionsCellItem, GridRowParams
} from '@mui/x-data-grid'
import { DataGrid, GridRowsProp, GridRowParams, GridColDef } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { useAuth } from '@/context/auth'
import { TransactionResponse } from '@/components/transactions/types'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  transactions: any
  handleDeleteClick: (uuid: string) => void
  handleDoubleClick: (uuid: string) => void
}

const TransactionTable: React.FC<Types> = ({ transactions, handleDeleteClick, handleDoubleClick }) => {
  const [rows, setRows] = React.useState<GridRowsProp>([])
  const columns: GridColDef[] = [
    { field: 'account', headerName: 'Account', width: 150 },
    { field: 'category', headerName: 'Category', width: 230 },
    { field: 'budget', headerName: 'Budget', width: 200 },
    { field: 'amount', headerName: 'Amount', width: 80 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 70,
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

  const editTransaction = (params: GridRowParams) => {
    console.log(params.row.uuid)
    handleDoubleClick(params.row.uuid)
  }

  return (
    <Box style={{ height: '80vh', width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        onRowDoubleClick={editTransaction}
      />
    </Box>
  )
}

export default TransactionTable
