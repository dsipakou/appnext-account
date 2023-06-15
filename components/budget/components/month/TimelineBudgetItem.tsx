import React, { FC } from 'react'
import {
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography
} from '@mui/material'
import { teal } from '@mui/material/colors'
import ReceiptIcon from '@mui/icons-material/Receipt'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { EditForm } from '@/components/budget/forms'
import {
  formatMoney
} from '@/utils/numberUtils'

interface Types {
  uuid: string
  spent: number
  planned: number
  date: string
  weekUrl: string
  monthUrl: string
  clickShowTransactions: (uuid: string) => void
}

const TimelineBudgetItem: FC<Types> = ({
  uuid,
  spent,
  planned,
  date,
  weekUrl,
  monthUrl,
  clickShowTransactions,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const percentage: number = Math.floor(spent * 100 / planned)
  const progressColor: string = planned === 0 ?
    "secondary" :
    Math.floor(percentage) > 100 ?
      "error" :
      "primary"

  const handleClickTransactions = (): void => {
    setAnchorEl(null)
    clickShowTransactions(uuid)
  }

  const handleClickEdit = (): void => {
    setAnchorEl(null)
  }

  const handleClickDelete = (): void => {
    setAnchorEl(null)
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          height: 60,
          width: '60%',
          border: '1px solid',
          backgroundColor: teal[50],
          cursor: 'pointer'
        }}
        onClick={handleClick}
      >
        <Grid container>
          <Grid item xs={12}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
              width: '100%'
            }}>
              <Typography align="center" sx={{ fontSize: "1.3em", fontWeight: 'bold' }}>
                {formatMoney(spent)}
              </Typography>
              {!!planned &&
                <>
                  <Typography sx={{ mx: 1 }}>of</Typography>
                  <Typography>
                    {formatMoney(planned)}
                  </Typography>
                  </>
            }
              <Box
                sx={{
                  position: 'absolute',
                  top: 3,
                  left: 5
                }}
              >
                <Chip
                  size="small"
                  label={date}
                  sx={{
                    fontSize: '0.7em',
                    height: '90%',
                    backgroundColor: 'grey',
                    color: 'white'
                  }}
                  />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ position: "relative" }}>
              <LinearProgress
                variant="determinate"
                color={progressColor}
                value={percentage > 100 ? percentage % 100 : percentage}
                sx={{
                  height: 20,
                  mx: 2,
                }}
                />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{
                  display: "flex",
                  color: "white",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}>{planned === 0
                    ? 'Not planned'
                    : `${percentage}%`
                }
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClickTransactions}>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText>
            Transactions
          </ListItemText>
        </MenuItem>
        <Divider />
        <EditForm uuid={uuid} weekUrl={weekUrl} monthUrl={monthUrl} />
        <MenuItem onClick={handleClickEdit}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>
            Edit
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClickDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
      </>
  )
}

export default TimelineBudgetItem
