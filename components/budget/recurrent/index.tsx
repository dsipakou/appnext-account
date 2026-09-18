import type { FC } from "react";

import Container from "@/components/budget/components/recurrent/Container";
import withBudgetTemplate from "@/components/budget/hoc";

const RecurrentTemplate = withBudgetTemplate(Container);

const Index: FC = () => {
  return <RecurrentTemplate activeType="recurrent" />;
};

export default Index;
