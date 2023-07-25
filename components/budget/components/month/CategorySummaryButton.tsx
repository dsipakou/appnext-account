import { FC } from 'react'
import {
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import { grey, teal, green, red } from '@mui/material/colors'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  title: string
  isActive: boolean
  planned: number
  spent: number
  currencyCode: string
}

const CategorySummaryButton: FC<Types> = ({ title, isActive, planned, spent, currencyCode }) => {
  const maxValue: number = Math.max(planned, spent)

  const spentPercent: number = spent * 100 / maxValue

  const plannedPercent: number = planned * 100 / maxValue

  return (
    <div className={`h-[80px] rounded-md cursor-pointer ${isActive ? 'w-[92%] border-slate-300 bg-slate-400 text-slate-50' : 'hover:drop-shadow-lg drop-shadow bg-white w-[90%]'}`}>
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
                  <Typography align="right" sx={{ fontSize: "1.3em" }}>
                    {formatMoney(planned, currencyCode)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={1} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  square
                  elevation={0}
                  sx={{
                    backgroundColor: grey[400],
                    width: "100%",
                    height: `${plannedPercent}%`,
                  }}
                ></Paper>
              </Grid>
            </Grid>
            <Grid container spacing={1}>
              <Grid item xs={1} sx={{ display: "flex", alignItems: "end" }}>
                <Paper
                  square
                  elevation={0}
                  sx={{
                    backgroundColor: spentPercent > plannedPercent ? red[500] : green[500],
                    width: "100%",
                    height: `${spentPercent}%`,
                  }}
                ></Paper>
              </Grid>
              <Grid item xs={11}>
                <Stack>
                  <Typography align="left" sx={{ fontSize: "1.3em", fontWeight: "bold" }}>
                    {formatMoney(spent, currencyCode)}
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
    </div>
  )
}

export default CategorySummaryButton
