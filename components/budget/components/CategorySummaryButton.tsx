import { FC } from 'react';
import {
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

interface Types {
  title: string
}

const CategorySummaryButton: FC<Types> = ({ title }) => {
  return (
    <Paper
      sx={{ height: 80, width: "90%", borderRadius: 5 }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} sx={{ height: 40, mt: 1 }}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" sx={{ mx: 1 }} flexItem />}
            sx={{ display: "flex", alignItems: "end", height: "100%" }}
          >
            <Grid container spacing={1}>
              <Grid item xs={11}>
                <Stack>
                  <Typography align="end" sx={{ fontSize: "1.3em" }}>
                    1500
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={1} sx={{ display: "flex", alignItems: "end" }}>
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
              <Grid item xs={1} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: "warning.light",
                    width: "100%",
                    height: "100%",
                  }}
                ></Paper>
              </Grid>
              <Grid item xs={11}>
                <Stack>
                  <Typography align="start" sx={{ fontSize: "1.3em" }}>
                    2000
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography sx={{ fontSize: "1.2em" }}>
            {title}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default CategorySummaryButton;
