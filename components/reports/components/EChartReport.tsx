import React from 'react'
import ReactECharts from 'echarts-for-react'
import { useSession } from 'next-auth/react'
import { useStore } from '@/app/store'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTransactionsMonthlyReport } from '@/hooks/transactions'
import { getFormattedDate } from '@/utils/dateUtils'
import {
  addMonths,
  endOfMonth,
  getDate, startOfMonth, subMonths
} from 'date-fns'
import { ChartCategory, ChartData } from '../types'
import RangeSwitcher from './RangeSwitcher'

interface GroupByCategory {
  [key: string]: number[]
}

const EChartReport: React.FC = () => {
  const [tooltipAxis, setTooltipAxis] = React.useState<'axis' | 'item'>('axis')
  const [date, setDate] = React.useState<Date>(new Date())
  const [upToDay, setUpToDay] = React.useState<number>(getDate(new Date()))
  const [showUpToDay, setShowUpToDay] = React.useState<boolean>(false)
  const [showIncome, setShowIncome] = React.useState<boolean>(false)
  const [options, setOptions] = React.useState({})

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)))
  const dateTo = getFormattedDate(endOfMonth(date))

  const { data: { user: authUser } } = useSession()
  const { data: chartData = [] } = useTransactionsMonthlyReport(
    dateFrom,
    dateTo,
    authUser?.currency,
    showUpToDay ? upToDay : undefined
  )
  const currencySign = useStore((state) => state.currencySign)

  const monthDayArray = Array.from({ length: 31 }, (_, i) => i + 1)

  React.useEffect(() => {
    if (chartData.length === 0) return

    const groupByCategory: GroupByCategory = chartData.reduce((acc: GroupByCategory, curr: ChartData) => {
      curr.categories.forEach((category: ChartCategory) => {
        acc[category.name] = acc[category.name] || []
        acc[category.name].push(category.value)
      })
      return acc
    }, {})

    const outcomeCategories = chartData[0].categories.filter((item: ChartCategory) => item.categoryType === 'EXP')
    const incomeCategories = chartData[0].categories.filter((item: ChartCategory) => item.categoryType === 'INC')
    const diffArray = chartData.map((item: ChartData) => {
      const outcome = item.categories.reduce((acc: number, category: ChartCategory) => {
        if (category.categoryType === 'EXP') acc += category.value
        return acc
      }, 0)
      const income = item.categories.reduce((acc: number, category: ChartCategory) => {
        if (category.categoryType === 'INC') acc += category.value
        return acc
      }, 0)
      return income - outcome
    })

    // Add outcome
    const formattedSeries = outcomeCategories.map(
      (item: ChartCategory) => (
        {
          name: item.name,
          data: groupByCategory[item.name] || [],
          stack: 'outcome',
          type: 'bar',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          },
          label: {
            show: true,
            fontSize: 10,
            formatter: (params) => params.value > 1000 ? '-' + Number(params.value / 1000).toFixed(2) + 'k' : '-' + Number(params.value).toFixed(0),
            textBorderColor: 'black',
            textBorderWidth: 2,
            color: 'white'
          }
        }
      )
    )

    // Add income
    if (showIncome) {
      formattedSeries.push(
        ...incomeCategories.map(
          (item: ChartCategory) => (
            {
              name: item.name,
              data: groupByCategory[item.name] || [],
              stack: 'income',
              sampling: 'sum',
              type: 'bar',
              emphasis: {
                focus: 'series',
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0,0,0,0.3)'
                }
              },
              label: {
                show: true,
                formatter: (params) => '+' + Number(params.value).toFixed(0),
                fontSize: 10,
                textBorderColor: 'white',
                textBorderWidth: 2,
                color: 'black'
              }
            }
          )
        )
      )
    }

    // Add difference
    if (showIncome) {
      formattedSeries.push(
        {
          name: 'Difference',
          data: diffArray || [],
          stack: 'difference',
          itemStyle: {
            color: '#ddd'
          },
          type: 'bar',
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.3)'
            }
          },
          label: {
            show: true,
            formatter: (params) => Number(params.value).toFixed(0),
            fontSize: 10,
            textBorderColor: 'white',
            textBorderWidth: 2,
            color: 'black'
          }
        }
      )
    }

    const optionsLocal = {
      xAxis: {
        type: 'category',
        data: chartData.map((item: ChartData) => item.date)
      },
      yAxis: {
        type: 'value',
        minInterval: 100,
        maxInterval: 20000,
        splitNumber: 20
      },
      grid: {
        left: '3%',
        bottom: '3%',
        containLabel: true,
        width: '80%'
      },
      legend: {
        data: outcomeCategories.map((item: ChartCategory) => item.name),
        orient: 'vertical',
        top: 'center',
        right: 10,
        width: '20%'
      },
      series: formattedSeries,
      tooltip: {
        position: (point: number[]) => {
          return [point[0] + 60, point[1] % 200]
        },
        trigger: tooltipAxis,
        formatter: (params, ticket) => {
          if (tooltipAxis === 'axis') {
            let output = '<table class="table-auto"><tbody>'
            const outcomeTotal = params.reduce((acc: unknown, item: unknown) => {
              if (outcomeCategories.map((category: ChartCategory) => category.name).includes(item.seriesName)) {
                acc += item.value
              }
              return acc
            }, 0)
            output += `<tr><td class="pb-3 font-bold">Expenses</td><td class="pb-3 italic text-right text-lg">- ${outcomeTotal.toFixed(2)} ${currencySign}</td></tr>`
            output += params.reduce((acc: unknown, item: unknown) => {
              if (outcomeCategories.map((category: ChartCategory) => category.name).includes(item.seriesName)) {
                acc += `<tr><td class="text-sm"><div class="flex"><div style="background-color: ${item.color}" class="h-4 w-4 mr-3"></div><span>${item.seriesName}</span></div></td><td class="italic text-sm px-5 font-semibold">- ${Number(item.value).toFixed(2)} ${currencySign}</td></tr>`
              }
              return acc
            }, '')
            if (!showIncome) {
              output += '</tbody></table>'
              return output
            }
            const incomeTotal = params.reduce((acc: unknown, item: unknown) => {
              if (incomeCategories.map((category: ChartCategory) => category.name).includes(item.seriesName)) {
                acc += item.value
              }
              return acc
            }, 0)
            output += `<tr><td class="py-3 font-bold">Income</td><td class="py-3 italic text-right text-lg">+ ${incomeTotal.toFixed(2)} ${currencySign}</td></tr>`
            output += params.reduce((acc: unknown, item: unknown) => {
              if (incomeCategories.map((item: ChartCategory) => item.name).includes(item.seriesName)) {
                acc += `<tr><td class="text-sm">${item.seriesName}</td><td class="text-sm px-5 italic font-semibold">+ ${Number(item.value).toFixed(2)} ${currencySign}</td></tr>`
              }
              return acc
            }, '')
            params.forEach((item: unknown) => {
              if (item.seriesName === 'Difference') {
                output += `<tr><td class="py-2 font-bold"><div class="flex items-center"><div style="background-color: ${item.color}" class="h-4 w-4 mr-3"></div>Balance</div></td><td class="font-bold italic text-right text-lg">${Number(item.value).toFixed(2)} ${currencySign}</td></tr>`
              }
            })
            output += '</tbody></table>'
            return output
          }
          return params.seriesName + ' ' + params.value.toFixed(2)
        }
      }
    }

    setOptions(optionsLocal)
  }, [chartData, showIncome])

  return (
    <div className="flex flex-col relative gap-2">
      <div className="flex flex-row justify-center">
        <RangeSwitcher
          dateFrom={dateFrom}
          dateTo={dateTo}
          clickBack={() => setDate(subMonths(date, 1))}
          clickForward={() => setDate(addMonths(date, 1))}
        />
      </div>
      <div className="flex justify-start">
        <div className="flex items-center gap-2 m-3">
          <Checkbox
            checked={showUpToDay}
            onClick={() => setShowUpToDay(!showUpToDay)}
          />
          <span className="flex items-center text-sm">
            Show till this
          </span>
          <Select
            defaultValue={upToDay}
            onValueChange={setUpToDay}
          >
            <SelectTrigger className="relative bg-white h-8 w-14">
              <SelectValue placeholder="Show up to this day" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Day</SelectLabel>
                {monthDayArray.map((day: number, index: number) => (
                  <SelectItem value={day} key={index}>{day}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <span className="flex items-center text-sm">
            day of each month
          </span>
          <Checkbox
            checked={showIncome}
            onClick={() => setShowIncome(!showIncome)}
          />
          <span className="flex items-center text-sm">
            Show income
          </span>
        </div>
      </div>
      <div>
        <ReactECharts style={{ height: '650px' }} option={options} notMerge={true} />
      </div>
    </div>
  )
}

export default EChartReport
