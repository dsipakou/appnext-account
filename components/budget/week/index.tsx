import { FC } from 'react';

import Container from '@/components/budget/components/week/Container';
import withBudgetTemplate from '@/components/budget/hoc';

const WeekTemplate = withBudgetTemplate(Container);

const Index: FC = () => {
  return <WeekTemplate activeType="week" />;
};

export default Index;
