import { FC } from 'react';
import {
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

const GeneralSummaryCard: FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{ height: 80, border: '1px solid' }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Typography align="center" sx={{ fontWeight: "bold" }}>
            Month Summary
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" sx={{ mx: 1 }} flexItem />}
          >
            <Grid container spacing={1}>
              <Grid item xs={10}>
                <Stack>
                  <Typography align="end" sx={{ fontSize: "1.3em" }}>
                    30000
                  </Typography>
                  <Typography align="end" sx={{ fontSize: "0.8em" }}>
                    Planned
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={2} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: "warning.light",
                    width: "100%",
                    height: "80%",
                  }}
                ></Paper>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={2} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: "warning.light",
                    width: "100%",
                    height: "100%",
                  }}
                ></Paper>
              </Grid>
              <Grid item xs={10}>
                <Stack>
                  <Typography align="start" sx={{ fontSize: "1.3em" }}>
                    40000
                  </Typography>
                  <Typography align="start" sx={{ fontSize: "0.8em" }}>
                    Actual
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </Paper >
  )
}

export default GeneralSummaryCard;
