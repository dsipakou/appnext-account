import type React from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBillingSubscription } from "@/hooks/billing";

BillingCancel.auth = {};

export default function BillingCancel(): React.ReactElement {
  const { data: billing } = useBillingSubscription();
  const plan = billing?.effectivePlan;

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Checkout cancelled</CardTitle>
          <CardDescription>No billing changes were made.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Current plan: {plan?.name ?? "Loading..."}</p>
        </CardContent>
        <CardFooter>
          <Button render={<Link href="/billing" />}>Back to billing</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
