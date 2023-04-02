import dynamic from 'next/dynamic'
import React from 'react'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface Types {
  chartData
}

const ChartReport: React.FC = () => {
  const [options, setOptions] = useState({});
  const [series, setSeries] = useState([]);
  const chartData = []

  setOptions({
    chart: {
      id: "main-chart",
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
    xaxis: {
      categories: chartData[0].data.map((item: ChartRate) => item.rateDate).reverse(),
      type: "datetime",
      labels: {
        rotateAlways: false,
        hideOverlappingLabels: true,
        rotate: -30
      }
    },
    noData: {
      text: "Please, select at least one currency",
    }
  })

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="line"
        width="1000"
        height="380"
      />
    </div>
  )
}

export default ChartReport
