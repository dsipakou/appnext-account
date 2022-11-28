import { FC } from 'react';
import {
  Box,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';

const SubCategorySummaryButton: FC = () => {
  return (
    <Paper elevation={0}
      sx={{
        height: 162,
        backgroundColor: '#F4F6F8',
        border: "1px solid rgba(0, 0, 0, 0.2)",
        p: 2,
      }}
    >
      <Grid container>
        <Grid item xs={6}>
          <Typography>1 password</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography align="right">weekly</Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography align="center">123 spent</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography>2x</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography></Typography>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ position: "relative" }}>
            <LinearProgress
              variant="determinate"
              value={50}
              sx={{
                height: 40,
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
              <Typography variant="h5" sx={{
                display: "flex",
                color: "white",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}>50%</Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Typography>12 left</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography align="right">of 25</Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default SubCategorySummaryButton;
