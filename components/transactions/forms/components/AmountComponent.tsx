import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import { Input } from '@/components/ui/input'

interface AmountComponentTypes extends GridRenderEditCellParams { }

const AmountComponent: React.FC<AmountComponentTypes> = (params) => {
  const { id, field, value } = params
  const apiRef = useGridApiContext()
  const inputRef = React.createRef<HTMLInputElement>()

  React.useEffect(() => {
    inputRef.current?.select()
  }, [])

  const handleChange = (event: InputEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value })
  }

  return (
    <div className="flex w-full h-full bg-slate-100 p-[2px] select-none items-center">
      <Input
        className="flex bg-white rounded-xl h-full border-2 text-xs"
        value={value}
        ref={inputRef}
        onChange={handleChange}
      />
      <span className="xl:pr-2 pl-1 text-xs font-semibold">{params.row.currency?.sign}</span>
    </div>
  )
}

export default AmountComponent
