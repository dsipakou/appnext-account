import React from 'react'
import {
  useGridApiContext,
  GridRenderEditCellParams
} from '@mui/x-data-grid'
import { Input } from '@/components/ui/input'

interface Types extends GridRenderEditCellParams { }

const DescriptionComponent: React.FC<Types> = (params) => {
  const { id, field, value } = params
  const apiRef = useGridApiContext()

  const handleChange = (event: InputEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value })
  }

  return (
    <div className="flex w-full h-full bg-slate-100 select-none items-center">
      <Input
        className="flex bg-white rounded-lg border h-full text-xs"
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}

export default DescriptionComponent
