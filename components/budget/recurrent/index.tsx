import { FC } from 'react';
import withBudgetTemplate from '@/components/budget/hoc';
import Container from '@/components/budget/components/occasional';

const RecurrentTemplate = withBudgetTemplate(Container);

const Index: FC = () => {
  return <RecurrentTemplate activeType="recurrent" />;
};

export default Index;
