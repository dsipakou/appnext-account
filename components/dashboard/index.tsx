import RecentTransactions from '@/components/dashboard/components/RecentTransactions';
import UpcommingExpenses from '@/components/dashboard/components/UpcommingExpenses';
import WeekWidget from '@/components/dashboard/components/WeekWidget';

const Dashboard = () => {
  return (
    <div className="min-h-screen space-y-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800">Your dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <WeekWidget />
        <RecentTransactions />
        <UpcommingExpenses />
      </div>
    </div>
  );
};

export default Dashboard;
