import React from 'react'
import {
  GridRenderEditCellParams,
  useGridApiContext
} from '@mui/x-data-grid'
import {
  TextField
} from '@mui/material'

interface AmountComponentTypes extends GridRenderEditCellParams { }

const AmountComponent: React.FC<AmountComponentTypes> = (params) => {
  const { id, field, value } = params
  const apiRef = useGridApiContext()
  const inputRef = React.createRef<HTMLInputElement>()

  React.useEffect(() => {
    inputRef.current?.select()
  }, [])

  const handleChange = (newValue: any) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue.target.value })
  }

  return (
    <TextField
      value={value}
      onChange={handleChange}
      inputProps={{ ref: inputRef }}
    />
  )
}

export default AmountComponent
