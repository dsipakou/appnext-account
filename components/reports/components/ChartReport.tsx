import dynamic from 'next/dynamic'
import React from 'react'
import { useTransactionsMonthlyReport } from '@/hooks/transactions'
import { getFormattedDate } from '@/utils/dateUtils'
import {
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material'
import { useAuth } from '@/context/auth'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Types {
  chartData
}

const ChartReport: React.FC = () => {
  const [options, setOptions] = React.useState({});
  const [series, setSeries] = React.useState([]);
  const [categoriesList, setCategoriesList] = React.useState<string[]>([])
  const { user: authUser } = useAuth()
  const { data: chartData = [] } = useTransactionsMonthlyReport("2022-04-01", "2023-03-31", authUser?.currency)
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
      plotOptions: {
        bar: {
          borderRadius: 1,
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
          <FormControlLabel control={
            <Checkbox
              checked={disabledCategories.length === 0}
              indeterminate={disabledCategories.length > 0 && disabledCategories.length !== categoriesList.length}
              onClick={selectAll}
            />
          } label="Select/Unselect all" />
          {chartData[0].categories.map((item: unknown) => (
            <FormControlLabel className="pl-3" control={<Checkbox checked={!disabledCategories.includes(item.name)} onClick={() => clickCategory(item.name)} />} label={item.name} />
          ))}
        </FormGroup>
      </div>
    </div>
  )
}

export default ChartReport
