import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useBillingSubscription } from "@/hooks/billing";

BillingSuccess.auth = {};

export default function BillingSuccess(): React.ReactElement {
  const [pollingFinished, setPollingFinished] = React.useState(false);
  const { data: billing, mutate } = useBillingSubscription();
  const plan = billing?.effectivePlan;
  const isPaid = plan?.code === "INDIVIDUAL" || plan?.code === "FAMILY";

  React.useEffect(() => {
    if (isPaid) {
      setPollingFinished(true);
      return;
    }

    let attempts = 0;
    const intervalId = globalThis.setInterval(() => {
      const pollSubscription = async () => {
        attempts += 1;
        const nextBilling = await mutate();

        if (
          nextBilling?.effectivePlan.code === "INDIVIDUAL" ||
          nextBilling?.effectivePlan.code === "FAMILY"
        ) {
          setPollingFinished(true);
          globalThis.clearInterval(intervalId);
          return;
        }

        if (attempts >= 6) {
          setPollingFinished(true);
          globalThis.clearInterval(intervalId);
        }
      };

      void pollSubscription();
    }, 1500);

    return () => globalThis.clearInterval(intervalId);
  }, [isPaid, mutate]);

  return (
    <div className="container mx-auto flex flex-1 items-center justify-center py-10">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Billing checkout</CardTitle>
          <CardDescription>
            We are checking your subscription status with the backend.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!pollingFinished && (
            <div className="flex items-center gap-3">
              <Spinner />
              <span>Payment is being confirmed...</span>
            </div>
          )}
          {pollingFinished && isPaid && (
            <p>Your subscription is active. Current plan: {plan?.name}.</p>
          )}
          {pollingFinished && !isPaid && (
            <p>Payment is being processed. Refresh shortly to see the updated plan.</p>
          )}
        </CardContent>
        <CardFooter>
          <Button render={<Link href="/billing" />}>Back to billing</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
