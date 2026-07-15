import { FC } from 'react';

import Container from '@/components/budget/components/month/Container';
import withBudgetTemplate from '@/components/budget/hoc';

const MonthTemplate = withBudgetTemplate(Container);

const Index: FC = () => {
  return <MonthTemplate activeType="month" />;
};

export default Index;
