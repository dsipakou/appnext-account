import dynamic from 'next/dynamic';
import React from 'react';
import { useSession } from 'next-auth/react';
import { TransactionResponse } from '@/components/transactions/types';

const Chart = dynamic(async () => await import('react-apexcharts'), { ssr: false });

interface Types {
  transactions: TransactionResponse[];
}

const DailyChart: React.FC<Types> = ({ transactions }) => {
  const [groupedTransactions, setGroupedTransactions] = React.useState([]);
  const { data } = useSession();
  const user = data?.user;

  React.useEffect(() => {
    if (!transactions) return;

    setGroupedTransactions(
      transactions?.reduce((acc, item: TransactionResponse) => {
        const summ = (acc[item.categoryDetails.parentName] || 0) + item.spentInCurrencies[user?.currency];
        acc[item.categoryDetails.parentName] = Number(summ.toFixed(2));
        return acc;
      }, {})
    );
  }, [transactions]);

  return (
    <>
      <Chart
        type="donut"
        series={Object.values(groupedTransactions)}
        options={{
          labels: Object.keys(groupedTransactions),
        }}
        width="350"
      />
    </>
  );
};

export default DailyChart;
