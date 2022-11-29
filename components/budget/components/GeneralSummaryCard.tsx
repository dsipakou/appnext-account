import { FC } from 'react'
import {
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import { blue, yellow, grey } from '@mui/material/colors'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  planned: number
  spent: number
}

const GeneralSummaryCard: FC<Types> = ({ planned, spent }) => {
  const maxValue: number = Math.max(planned, spent)

  const spentPercent = spent * 100 / maxValue

  const plannedPercent = planned * 100 / maxValue
  return (
    <Paper
      elevation={0}
      sx={{ height: 80, border: '1px solid', backgroundColor: grey[700], color: "white" }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Typography align="center" sx={{ color: yellow[500] }}>
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
                  <Typography align="right" sx={{ fontSize: "1.3em", fontWeight: "bold" }}>
                    {formatMoney(planned)}
                  </Typography>
                  <Typography align="right" sx={{ fontSize: "0.8em" }}>
                    Planned
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={2} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: yellow[700],
                    width: "100%",
                    height: `${plannedPercent}%`,
                  }}
                ></Paper>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={2} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: yellow[700],
                    width: "100%",
                    height: `${spentPercent}%`,
                  }}
                ></Paper>
              </Grid>
              <Grid item xs={10}>
                <Stack>
                  <Typography align="left" sx={{ fontSize: "1.3em", fontWeight: "bold" }}>
                    {formatMoney(spent)}
                  </Typography>
                  <Typography align="left" sx={{ fontSize: "0.8em" }}>
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
