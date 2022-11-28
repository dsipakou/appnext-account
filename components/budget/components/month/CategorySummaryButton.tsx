import { FC } from 'react'
import {
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material'
import { teal } from '@mui/material/colors'
import { formatMoney } from '@/utils/numberUtils'

interface Types {
  title: string
  isActive: boolean
  planned: number
  spent: number
  currencyCode: string
}

const CategorySummaryButton: FC<Types> = ({ title, isActive, planned, spent, currencyCode }) => {
  return (
    <Paper
      sx={
        {
          height: 80,
          width: isActive ? "91%" : "90%",
          borderRadius: 3,
          border: isActive ? "2px solid rgba(0, 0, 0, 0.2)" : "",
          backgroundColor: isActive ? teal[50] : ""
        }
      }
      elevation={
        isActive ? 0 : 3
      }
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
                  <Typography align="right" sx={{ fontSize: "1.3em" }}>
                    {formatMoney(planned, currencyCode)}
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
                  <Typography align="left" sx={{ fontSize: "1.3em" }}>
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
    </Paper>
  )
}

export default CategorySummaryButton;
