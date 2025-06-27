import dynamic from 'next/dynamic'
import React from 'react'
import { useSession } from 'next-auth/react'
import {
  addMonths,
  endOfMonth,
  getDate,
  subMonths,
  startOfMonth
} from 'date-fns'
import { useTransactionsMonthlyReport } from '@/hooks/transactions'
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
import { getFormattedDate } from '@/utils/dateUtils'
import RangeSwitcher from './RangeSwitcher'
import { ChartCategory, ChartData } from '../types'

const Chart = dynamic(async () => await import('react-apexcharts'), { ssr: false })
const ApexCharts = dynamic(async () => await import('apexcharts'), { ssr: false })

if (typeof window !== 'undefined') window.ApexCharts = ApexCharts

interface CategoryCheckbox {
  name: string
  checked: boolean
}

const ChartReport: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date())
  const [upToDay, setUpToDay] = React.useState<string>(getDate(new Date()))
  const [showUpToDay, setShowUpToDay] = React.useState<boolean>(false)
  const [categoryCheckboxes, setCategoryCheckboxes] = React.useState<CategoryCheckbox[]>([])
  const [categoriesList, setCategoriesList] = React.useState<Category[]>([])

  const [options, setOptions] = React.useState({})
  const [series, setSeries] = React.useState([])
  const { data: session } = useSession()
  const authUser = session?.user

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)))
  const dateTo = getFormattedDate(endOfMonth(date))
  const { data: chartData = [] } = useTransactionsMonthlyReport(
    dateFrom,
    dateTo,
    authUser?.currency ?? 'USD',
    showUpToDay ? upToDay : undefined
  )

  React.useEffect(() => {
    if (chartData.length === 0) return

    setOptions({
      chart: {
        id: 'main-chart',
        type: 'bar',
        stacked: true,
        events: {
          legendClick: (chartContext, seriesIndex, config) => {
            clickCategory(config.config.series[seriesIndex].name)
          }
        },
        legend: {
          onItemClick: {
            toggleDataSeries: false
          }
        },
        animations: {
          enabled: true,
          easing: 'linear',
          speed: 200,
          animateGradually: {
            enabled: false,
            delay: 50
          },
          dynamicAnimation: {
            enabled: true,
            speed: 40
          }
        }
      },
      dataLabels: {
        formatter: (value: number) => value > 1000 ? (Number(value) / 1000).toFixed(2) + 'k' : value
      },
      fill: {
        opacity: 1
      },
      plotOptions: {
        bar: {
          horizontal: false,
          dataLabels: {
            position: 'center',
            total: {
              enabled: true,
              formatter: (value: number) => value.toFixed(0),
              style: {
                fontWeight: 200
              }
            }
          }
        }
      },
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        categories: chartData.map((item: ChartData) => item.date),
        type: 'string'
      },
      noData: {
        text: ''
      }
    })

    const groupByCategory = chartData.reduce((acc, curr: ChartData) => {
      curr.categories.forEach((category: ChartCategory) => {
        acc[category.name] = acc[category.name] || []
        acc[category.name].push(category.value.toFixed(2))
      })
      return acc
    }, {})

    const formattedSeries = chartData[0].categories.map(
      (item: ChartCategory) => (
        {
          name: item.name,
          data: groupByCategory[item.name] || []
        }
      )
    )

    setSeries(formattedSeries)

    setCategoriesList(chartData[0].categories.map((item: ChartCategory) => item.name))

    setCategoryCheckboxes(chartData[0].categories.map((item: ChartCategory) => ({ name: item.name, checked: true })))
  }, [chartData])

  React.useEffect(() => {

  }, [categoryCheckboxes])

  const monthDayArray = Array.from({ length: 31 }, (_, i) => i + 1)

  const clickCategory = (categoryName: string) => {
    const result = window.ApexCharts.exec('main-chart', 'toggleSeries', categoryName)
    setCategoryCheckboxes((oldValue: CategoryCheckbox[]) => oldValue.map((item: CategoryCheckbox) => {
      if (item.name === categoryName) {
        return {
          name: item.name,
          checked: !item.checked
        }
      } else {
        return item
      }
    }))
  }

  const selectAll = () => {
    if (categoryCheckboxes.every((item: CategoryCheckbox) => item.checked)) {
      setCategoryCheckboxes((oldValues: CategoryCheckbox[]) => oldValues.map((item: CategoryCheckbox) => (
        {
          name: item.name,
          checked: false
        }
      )))
    } else {
      setCategoryCheckboxes((oldValues: CategoryCheckbox[]) => oldValues.map((item: CategoryCheckbox) => (
        {
          name: item.name,
          checked: true
        }
      )))
    }
  }

  if (chartData.length === 0) return

  const categoryTitles = chartData[0].categories.forEach((item: unknown) => item.name)

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
      <div className="flex flex-col bg-white rounded-md drop-shadow-sm">
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
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <Chart
            options={options}
            series={series}
            width="900"
            height="680"
            type="bar"
            onClick={(event) => console.log(event)}
          />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Checkbox
                checked={categoryCheckboxes.every((item: CategoryCheckbox) => item.checked)}
                onClick={selectAll}
              />
              <span className="text-sm">Select/Unselect all</span>
            </div>
            <div className="flex flex-col w-full pl-3 gap-2">
            {categoryCheckboxes.map((item: CategoryCheckbox, index: number) => (
              <div className="flex items-center gap-2" key={index}>
                <Checkbox checked={item.checked} onClick={() => clickCategory(item.name)} />
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartReport
