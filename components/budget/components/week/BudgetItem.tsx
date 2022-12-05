import { FC, useState } from 'react'
import { formatMoney } from '@/utils/numberUtils'
import { 
  Box,
  LinearProgress,
  Paper,
  Typography
} from '@mui/material'

interface Types {
  title: string
  planned: number
  spent: number
  isCompleted: boolean
}

const BudgetItem: FC<Types> = ({ title, planned, spent, isCompleted }) => {
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const percentage: number = Math.floor(spent * 100 / planned)
  const onMouseEnterHandler = () => {
    setShowDetails(true)
  }
  const onMouseLeaveHandler = () => {
    setShowDetails(false)
  }
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        p: 1,
        borderRadius: 3,
        zIndex: 1,
        '&:hover': {
          width: 250,
          zIndex: 2,
          boxShadow: '0 0 10px grey'
        },
        '&:mouseout': {
          zIndex: 1
        }
      }}
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <Typography
        align="center"
        noWrap
        sx={{
          fontSize: '0.9em',
          fontWeight: 'bold'
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        { showDetails && (
          <Typography
            sx={{
              fontSize: '0.9em',
              fontWeight: 'bold'
            }}
          >
            {formatMoney(spent)}
          </Typography>
        )}
        { showDetails && (
          <Typography
            sx={{
              fontSize: '0.8em',
              mx: 1
            }}
          >
            of
          </Typography>
        )}
        <Typography
          sx={{
            fontSize: '0.8em'
          }}
        >
          {formatMoney(planned)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {planned !== 0 
          ? (
            <>
              <LinearProgress
                variant="determinate"
                value={percentage > 100 ? percentage % 100 : percentage}
                sx={{
                  mx: 1,
                  width: '80%'
                }}
                />
              <Typography
                sx={{
                  fontSize: '0.9em'
                }}
              >
                {`${percentage}%`}
              </Typography>
            </>
          )
          : (
            <Typography
              align="center"
              sx={{
                fontSize: '0.8em',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Unplanned
            </Typography>
          )
        }
      </Box>
      <Typography
        sx={{
          fontSize: '0.8em',
          color: 'green',
          fontWeight: 'bold'
        }}
      >
        {isCompleted && 'Completed'}
      </Typography>

    </Paper>
  )
}

export default BudgetItem
