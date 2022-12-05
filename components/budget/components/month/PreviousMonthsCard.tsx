import { FC } from 'react'
import {
  Paper,
  Typography
} from '@mui/material'

const PreviousMonthsCard: FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%'
      }}
    >
      <Typography variant="h5">
        Previous 6 months
      </Typography>
    </Paper>
  )
}

export default PreviousMonthsCard
