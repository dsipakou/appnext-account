import dynamic from 'next/dynamic'
import React from 'react'
import { useTransactionsMonthlyReport } from '@/hooks/transactions'
import { getFormattedDate } from '@/utils/dateUtils'
import {
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Types {
  chartData
}

const ChartReport: React.FC = () => {
  const [options, setOptions] = React.useState({});
  const [series, setSeries] = React.useState([]);
  const { data: chartData = [] } = useTransactionsMonthlyReport("2022-06-01", "2023-03-31", "USD")
  const [disabledCategories, setDisabledCategories] = React.useState<string[]>([])

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
      stroke: {
        curve: "smooth",
      },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.6,
          opacityTo: 0.8,
        }
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
    debugger
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
  }, [chartData, disabledCategories])

  const clickCategory = (categoryName: string) => {
    const index = disabledCategories.indexOf(categoryName)

    if (index > -1) {
      const newItems = disabledCategories.filter((item: string) => item !== categoryName)
      setDisabledCategories(newItems)
    } else {
      setDisabledCategories([...disabledCategories, categoryName])
    }
  }

  if (chartData.length === 0) return

  const categoryTitles = chartData[0].categories.forEach((item: unknown) => item.name)

  return (
    <div className="flex flex-row gap-4">
      <Chart
        options={options}
        series={series}
        type="bar"
        width="1000"
        height="680"
      />
      <div>
        <FormGroup className="w-80">
          {chartData[0].categories.map((item: unknown) => (
            <FormControlLabel control={<Checkbox checked={!disabledCategories.includes(item.name)} onClick={() => clickCategory(item.name)} />} label={item.name} />
          ))}
        </FormGroup>
      </div>
    </div>
  )
}

export default ChartReport
