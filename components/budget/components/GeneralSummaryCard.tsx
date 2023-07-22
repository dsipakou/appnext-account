import { FC } from 'react'
import { useSession} from 'next-auth/react'
import {
  Grid,
  Paper,
  Typography
} from '@mui/material'
import { yellow, grey } from '@mui/material/colors'
import { formatMoney } from '@/utils/numberUtils'
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '@/components/currencies/types'

interface Types {
  title: string
  planned: number
  spent: number
}

const GeneralSummaryCard: FC<Types> = ({ title, planned, spent }) => {
  const { data: currencies = [] } = useCurrencies()
  const { data: { user: authUser }} = useSession()

  const maxValue: number = Math.max(planned, spent)

  const spentPercent = spent * 100 / maxValue

  const plannedPercent = planned * 100 / maxValue

  const currencySign = currencies.find(
    (currency: Currency) => currency.code === authUser?.currency
  )?.sign || '';

  return (
    <Paper
      elevation={0}
      sx={{ height: 80, border: '1px solid', backgroundColor: grey[700], color: "white" }}
    >
      <Grid container>
        <Grid item xs={12}>
          <Typography align="center" sx={{ color: yellow[500] }}>
            {title.charAt(0).toUpperCase() + title.slice(1)} Summary
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <div className="flex">
            <div className="flex flex-1">
              <div className="flex flex-1 justify-end">
                <div className="flex flex-col h-full">
                  <div className="flex justify-end text-2xl">
                    {formatMoney(planned)} {currencySign}
                  </div>
                  <div className="flex justify-end text-xs items-end">
                    Planned
                  </div>
                </div>
              </div>
              <div className="flex items-start ml-2">
                <div className="rounded bg-yellow-400 w-5" style={{height: `${plannedPercent}%`}}></div>
              </div>
            </div>
            <div className="w-[1px] bg-gray-500 mx-1"></div>
            <div className="flex flex-1">
              <div className="flex items-end mr-2 h-full">
                <div className="rounded bg-yellow-400 w-5" style={{height: `${spentPercent}%`}}></div>
              </div>
              <div className="flex flex-1 justify-start">
                <div className="flex flex-col h-full">
                  <div className="flex justify-start text-2xl">
                    {formatMoney(spent)} {currencySign}
                  </div>
                  <div className="flex justify-start text-xs">
                    Actual
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default GeneralSummaryCard;
