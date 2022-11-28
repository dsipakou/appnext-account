import { FC } from 'react';
import {
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import SubCategorySummaryButton from './SubCategorySummaryButton';

interface Types {
  title: string
}

const DetailsPanel: FC<Types> = ({ title = "Choose category" }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: 5,
      }}
    >
      <Stack justifyContent="center" sx={{ p: 2 }}>
        <Typography align="center" variant="h3">
          {title}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <SubCategorySummaryButton />
          </Grid>
          <Grid item xs={6}>
            <SubCategorySummaryButton />
          </Grid>
          <Grid item xs={6}>
            <SubCategorySummaryButton />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  )
}

export default DetailsPanel;
