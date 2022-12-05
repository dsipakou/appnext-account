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
        backgroundColor: 'lightGrey'
      }}
    >
      <Typography sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}>
        {title}
      </Typography>
    </Box>
  )
}

export default HeaderItem
