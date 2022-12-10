import { FC } from 'react'
import {
  Box,
  Typography
} from '@mui/material'

interface Types {
  title: string
}

const HeaderItem: FC<Types> = ({ title }) => {
  return (
    <Box
      sx={{
        height: 50,
        width: '100%',
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.4)',
        backgroundColor: 'lightGrey'
      }}
    >
      <Typography sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: '1.2em',
        fontWeight: 'bold'
      }}>
        {title}
      </Typography>
    </Box>
  )
}

export default HeaderItem
