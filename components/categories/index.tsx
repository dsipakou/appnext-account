import React from "react";

import Toolbar from "@/components/common/layout/Toolbar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useCategories } from "@/hooks/categories";
import { cn } from "@/lib/utils";

import type { Category } from "./types";

import Income from "./components/Income";
import Outcome from "./components/Outcome";
import AddForm from "./forms/AddForm";

const Index = (): React.ReactElement => {
  const { data: categories = [] } = useCategories();
  const [activeType, setActiveType] = React.useState<"income" | "outcome">("outcome");

  const parentCategories: Category[] =
    categories?.filter((item: Category) => item.parent === null && item.type !== "INC") || [];

  const categoriesByParent = (uuid: string): Category[] => {
    return categories?.filter((item: Category) => item.parent === uuid) || [];
  };

  const emptyState = (
    <div className="flex flex-1 items-center justify-center">
      <Empty className="max-w-2xl border bg-white shadow-sm">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <span className="text-xl">#</span>
          </EmptyMedia>
          <EmptyTitle>Create your first category</EmptyTitle>
          <EmptyDescription>
            Categories help group your spending and income, so reports and budgets stay meaningful.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddForm />
        </EmptyContent>
      </Empty>
    </div>
  );

  let content = (
    <Outcome parentCategories={parentCategories} categoriesByParent={categoriesByParent} />
  );

  if (categories.length === 0) {
    content = emptyState;
  } else if (activeType === "income") {
    content = <Income />;
  }

  return (
    <>
      <Toolbar title={"Categories"}>
        <div className="flex rounded-md bg-blue-500">
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === "outcome"}
            onClick={() => setActiveType("outcome")}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-xl text-white",
                activeType === "outcome" && "rounded-md bg-white text-blue-500",
              )}
            >
              Outcome
            </span>
          </Button>
          <Button
            className="w-45 p-px disabled:opacity-100"
            disabled={activeType === "income"}
            onClick={() => setActiveType("income")}
          >
            <span
              className={cn(
                "flex h-full w-full items-center justify-center text-xl text-white",
                activeType === "income" && "rounded-md bg-white text-blue-500",
              )}
            >
              Income
            </span>
          </Button>
        </div>
        <AddForm />
      </Toolbar>
      {content}
    </>
  );
};

export default Index;
