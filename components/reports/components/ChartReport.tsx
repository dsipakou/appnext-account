import dynamic from 'next/dynamic'
import React from 'react'
import { useSession } from 'next-auth/react'
import {
  addMonths,
  endOfMonth,
  getDate,
  subMonths,
  startOfMonth,
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
  SelectValue,
} from '@/components/ui/select'
import { getFormattedDate } from '@/utils/dateUtils'
import RangeSwitcher from './RangeSwitcher'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const ChartReport: React.FC = () => {
  const [date, setDate] = React.useState<Date>(new Date())
  const [upToDay, setUpToDay] = React.useState<string>(getDate(new Date()))
  const [showUpToDay, setShowUpToDay] = React.useState<boolean>(false)

  const [options, setOptions] = React.useState({});
  const [series, setSeries] = React.useState([]);
  const [categoriesList, setCategoriesList] = React.useState<string[]>([])
  const [disabledCategories, setDisabledCategories] = React.useState<string[]>([])
  const { data: { user: authUser }} = useSession()

  const dateFrom = getFormattedDate(startOfMonth(subMonths(date, 11)))
  const dateTo = getFormattedDate(endOfMonth(date))
  const { data: chartData = [] } = useTransactionsMonthlyReport(
    dateFrom,
    dateTo,
    authUser?.currency,
    showUpToDay ? upToDay : undefined,
  )

  React.useEffect(() => {
    if (chartData.length === 0) return

    setOptions({
      chart: {
        id: "main-chart",
        stacked: true,
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
      plotOptions: {
        bar: {
          borderRadius: 1,
          columnWidth: '95%',
          dataLabels: {
            position: 'center',
            total: {
              enabled: true,
              formatter: (value) => Number(value).toFixed(2),
              style: {
                fontWeight: 400,
              },
            },
          },
        }
      },
      stroke: {
        curve: "smooth",
      },
      fill: {
        opacity: 0.9,
      },
      xaxis: {
        categories: chartData.map((item: unknown) => item.date),
        type: "string",
        labels: {
          rotateAlways: false,
          hideOverlappingLabels: true,
          rotate: -30
        }
      },
      noData: {
        text: "Please wait...",
      }
    })

    const groupByCategory = chartData.reduce((acc, curr) => {
      curr.categories.forEach((category: unknown) => {
        if (!disabledCategories.includes(category.name)) {
          acc[category.name] = acc[category.name] || []
          acc[category.name].push(category.value.toFixed(2))
        }
      })
      return acc
    }, {})

    setSeries(
      chartData[0].categories.map(
        (item: unknown) => (
          {
            name: item.name,
            data: groupByCategory[item.name] || []
          }
        )
      )
    )

    setCategoriesList(chartData[0].categories.map((item: unknown) => item.name))
  }, [chartData, disabledCategories])

  const monthDayArray = Array.from({ length: 31 }, (_, i) => i + 1);

  const clickCategory = (categoryName: string) => {
    const index = disabledCategories.indexOf(categoryName)

    if (index > -1) {
      const newItems = disabledCategories.filter((item: string) => item !== categoryName)
      setDisabledCategories(newItems)
    } else {
      setDisabledCategories([...disabledCategories, categoryName])
    }
  }

  const selectAll = () => {
    if (categoriesList.length === disabledCategories.length) {
      setDisabledCategories([])
    } else {
      setDisabledCategories(categoriesList)
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
                  {monthDayArray.map((day: number) => (
                    <SelectItem value={day}>{day}</SelectItem>
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
            type="bar"
            width="900"
            height="680"
          />
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Checkbox
                checked={disabledCategories.length === 0}
                indeterminate={disabledCategories.length > 0 && disabledCategories.length !== categoriesList.length}
                onClick={selectAll}
              />
              <span className="text-sm">Select/Unselect all</span>
            </div>
            <div className="flex flex-col w-full pl-3 gap-2">
            {chartData[0].categories.map((item: unknown) => (
              <div className="flex items-center gap-2">
                <Checkbox checked={!disabledCategories.includes(item.name)} onClick={() => clickCategory(item.name)} />
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
