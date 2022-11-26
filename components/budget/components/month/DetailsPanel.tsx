import { FC } from 'react';
import {
  Paper,
  Stack,
  Typography,
} from '@mui/material';

interface Types {
  title: string
}

const DetailsPanel: FC<Types> = ({ title = "Choose category" }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderRadius: 5,
      }}
    >
      <Stack justifyContent="center">
        <Typography align="center" variant="h3">
          {title}
        </Typography>
      </Stack>
    </Paper>
  )
}

export default DetailsPanel;
