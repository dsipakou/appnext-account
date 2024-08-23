import React from 'react'
import {
  Check,
  CheckCheck,
  Minus,
  Pencil,
  Split,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  GridRenderCellParams,
  GridRowModesModel,
  GridRowModes,
  GridRowId
} from '@mui/x-data-grid'

interface Types extends GridRenderCellParams {
  rowModesModel: GridRowModesModel
  handleDeleteClick: (params: GridRenderCellParams) => void
  handleApplyChanges: (id: GridRowId) => void
  handleEditClick: (id: GridRowId) => void
  handleDuplicateClick: (params: GridRenderCellParams) => void
}

const ActionsReadComponent: React.FC<Types> = (params) => {
  const [prevState, setPrevState] = React.useState(null)
  const isInEditMode = params.rowModesModel[params.id]?.mode === GridRowModes.Edit

  React.useEffect(() => {
    setPrevState(params.row)
  }, [])

  const checkAndApply = (rowId: GridRowId) => {
    console.log(params.row)
    params.handleApplyChanges(rowId)()
    console.log(params.row)

    const isChanged = Object.keys(prevState).every((key) => prevState[key] === params.row[key])
    console.log('changed')
    console.log(isChanged)
    if (isChanged) {
      params.row.saved = false
    }
    console.log(rowId)
  }

  if (isInEditMode) {
    return (
      <div className="flex gap-3 px-2 justify-center items-center w-full h-full bg-slate-100">
        {!params.row.saved && (
          <>
            <div
              className="flex border-2 border-green-500 items-center justify-center w-5 h-5 rounded-full text-green-500"
              onClick={params.handleApplyChanges(params.id)}
            >
              <Check className="h-4" />
            </div>
            <div
              className="flex border-2 border-red-500 items-center justify-center w-5 h-5 rounded-full text-red-500"
              onClick={() => params.handleDeleteClick(params)}
            >
              <Minus />
            </div>
          </>
        )}
        {params.row.saved && (
          <div
            className="flex border-2 border-green-500 items-center justify-center w-5 h-5 rounded-full text-green-500"
            onClick={() => checkAndApply(params.id)}
          >
            <Check className="h-4" />
          </div>
        )}
      </div>
    )
  } else if (params.value) {
    return (
      <div className="flex gap-3 px-2 justify-center items-center w-full h-full bg-slate-100">
        <div
          className="text-gray-700"
        >
          <Pencil
            className="h-4 w-4 cursor-pointer"
            onClick={params.handleEditClick(params.id)}
          />
        </div>
        <div className="">
          <CheckCheck className="text-green-500" />
        </div>
      </div>
    )
  } else {
    return (
      <div className="flex w-full justify-center gap-2 items-center">
        <Button
          size="xs"
          className="border-2 border-blue-400 bg-blue-400 text-white"
          onClick={() => params.handleDuplicateClick(params)}
        >
          <Split className="h-4" />
        </Button>
        <Button
          size="xs"
          variant="destructive"
          onClick={() => params.handleDeleteClick(params)}
        >
          <Trash2 className="h-4" />
        </Button>
      </div>
    )
  }
}

export default ActionsReadComponent
