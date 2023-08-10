import * as React from 'react'
import { useSession } from 'next-auth/react'
import {
  GridActionsCellItem, GridRowParams
} from '@mui/x-data-grid'
import { DataGrid, GridRowsProp, GridRowParams, GridColDef } from '@mui/x-data-grid'
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
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
    { field: 'date', headerName: 'Date', flex: 0.7 },
    { field: 'account', headerName: 'Account', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    { field: 'budget', headerName: 'Budget', flex: 1 },
    { field: 'amount', headerName: 'Amount', type: 'number', flex: 0.4 },
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

  const { data: { user }} = useSession()

  React.useEffect(() => {
    if (!transactions) return

    setRows(transactions.map(
      (item: TransactionResponse, index: number) => (
        {
          id: index + 1,
          uuid: item.uuid,
          date: item.transactionDate,
          amount: formatMoney(item.spentInCurrencies[user?.currency]),
          category: item.categoryDetails.name,
          account: item.accountDetails.title,
          budget: item.budgetDetails?.title || '',
        }
      )
    ))
  }, [transactions])

  const editTransaction = (params: GridRowParams) => {
    handleDoubleClick(params.row.uuid)
  }

  const hiddenColumns = {
    // TODO: add hidden columns here
  }

  return (
    <div className="flex w-full h-screen">
      <DataGrid
        rows={rows}
        columns={columns}
        onRowDoubleClick={editTransaction}
        rowHeight={40}
        columnVisibilityModel={{
          ...hiddenColumns
        }}
      />
    </div>
  )
}

export default TransactionTable
