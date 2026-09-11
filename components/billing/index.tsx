import { CalendarClock, Check, Crown, Loader2 } from "lucide-react";
import React from "react";

import type { BillingChangePreviewResponse, BillingPlanCode, BillingTerm } from "@/hooks/billing";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import * as Dlg from "@/components/ui/dialog";
import { toastManager } from "@/components/ui/toast";
import {
  useBillingSubscription,
  useCancelBillingSubscription,
  useConfirmBillingChange,
  usePreviewBillingChange,
  useStartBillingCheckout,
} from "@/hooks/billing";

type PaidPlanCode = Exclude<BillingPlanCode, "FREE">;

type Tier = {
  code: BillingPlanCode;
  name: string;
  price: string;
  yearlyPrice?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

const buildCheckoutPayload = (plan: PaidPlanCode, term: BillingTerm) => ({
  plan,
  term,
  successUrl: `${globalThis.location.origin}/billing/success`,
  cancelUrl: `${globalThis.location.origin}/billing/cancel`,
});

const formatTerm = (term: BillingTerm) => term.toLowerCase();

const formatChangeDate = (date?: string) => {
  if (!date || date === "immediate") {
    return "the scheduled date";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsedDate);
};

const tiers: Tier[] = [
  {
    code: "FREE",
    name: "Free",
    price: "$0",
    description: "For tracking personal finances without sharing a workspace.",
    features: ["1 workspace member", "Personal accounts", "Transactions and budget reports"],
  },
  {
    code: "INDIVIDUAL",
    name: "Individual",
    price: "$5",
    yearlyPrice: "$50",
    description: "For one active user who wants full paid billing capabilities.",
    features: ["1 workspace member", "Monthly or yearly billing", "Stripe checkout sandbox"],
    highlighted: true,
  },
  {
    code: "FAMILY",
    name: "Family",
    price: "$12",
    yearlyPrice: "$120",
    description: "For household budgeting with shared workspace access.",
    features: ["Up to 5 workspace members", "Monthly or yearly billing", "Shared family budget"],
  },
];

const Index: React.FC = () => {
  const [pendingCheckout, setPendingCheckout] = React.useState<string>();
  const [pendingChangeKey, setPendingChangeKey] = React.useState<string>();
  const [changePreview, setChangePreview] = React.useState<BillingChangePreviewResponse>();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = React.useState(false);
  const { data: billing, isLoading, mutate: mutateBilling } = useBillingSubscription();
  const { trigger: startCheckout } = useStartBillingCheckout();
  const { trigger: previewBillingChange, isMutating: isPreviewingChange } =
    usePreviewBillingChange();
  const { trigger: confirmBillingChange, isMutating: isConfirmingChange } =
    useConfirmBillingChange();
  const { trigger: cancelSubscription, isMutating: isCancelling } = useCancelBillingSubscription();

  const currentPlan = billing?.effectivePlan;
  const currentPlanCode = currentPlan?.code;
  const subscription = billing?.subscription;
  const hasPaidSubscription = Boolean(subscription);
  const pendingServerChange = subscription?.pendingChange;
  const isChanging = isPreviewingChange || isConfirmingChange;

  const closeChangePreview = () => {
    if (isConfirmingChange) {
      return;
    }

    setChangePreview(undefined);
    setPendingChangeKey(undefined);
  };

  const handlePreviewChange = async (plan: PaidPlanCode, term: BillingTerm) => {
    try {
      setPendingChangeKey(`${plan}-${term}`);
      const preview = await previewBillingChange({ plan, term });
      setChangePreview(preview);
    } catch {
      setPendingChangeKey(undefined);
      toastManager.add({
        id: "billing-change-preview-error",
        title: "Plan change unavailable",
        description: "Could not preview this plan change. Please try again later.",
        type: "error",
      });
    }
  };

  const handlePlanAction = async (plan: PaidPlanCode, term: BillingTerm) => {
    if (hasPaidSubscription) {
      await handlePreviewChange(plan, term);
      return;
    }

    try {
      setPendingCheckout(`${plan}-${term}`);
      const response = await startCheckout(buildCheckoutPayload(plan, term));
      globalThis.location.href = response.checkoutUrl;
    } catch {
      setPendingCheckout(undefined);
      const nextBilling = await mutateBilling();

      if (nextBilling?.subscription) {
        await handlePreviewChange(plan, term);
        return;
      }

      toastManager.add({
        id: "billing-checkout-error",
        title: "Checkout failed",
        description: "Could not start Stripe checkout. Please try again later.",
        type: "error",
      });
    }
  };

  const handleConfirmChange = async () => {
    if (!changePreview) {
      return;
    }

    try {
      await confirmBillingChange({
        plan: changePreview.targetPlan,
        term: changePreview.targetTerm,
      });
      await mutateBilling();
      setChangePreview(undefined);
      setPendingChangeKey(undefined);
      toastManager.add({
        id: "billing-change-success",
        title: changePreview.changeType === "UPGRADE" ? "Plan upgraded" : "Plan change scheduled",
        type: "success",
      });
    } catch {
      toastManager.add({
        id: "billing-change-error",
        title: "Plan change failed",
        description: "Could not apply this plan change. Please try again later.",
        type: "error",
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(undefined);
      await mutateBilling();
      setIsCancelConfirmOpen(false);
      toastManager.add({
        id: "billing-cancel-success",
        title: "Subscription cancelled",
        type: "success",
      });
    } catch {
      toastManager.add({
        id: "billing-cancel-error",
        title: "Cancellation failed",
        description: "Could not cancel subscription. Please try again later.",
        type: "error",
      });
    }
  };

  return (
    <div className="container mx-auto flex flex-col gap-8 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="text-muted-foreground mt-2">
          Current plan: {isLoading ? "Loading..." : (currentPlan?.name ?? "Unknown")}
          {currentPlan && `, ${currentPlan.maxMembers} member limit`}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {tiers.map((tier) => {
          const isCurrent = tier.code === currentPlanCode;
          const isPaid = tier.code !== "FREE";
          const isActiveMonthly =
            subscription?.plan === tier.code && subscription.term === "MONTHLY";
          const isActiveYearly = subscription?.plan === tier.code && subscription.term === "YEARLY";

          return (
            <Card
              key={tier.code}
              className={`flex flex-col ${tier.highlighted ? "border-primary shadow-lg" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  {isCurrent && <Badge>Current</Badge>}
                </div>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="mb-4 text-4xl font-bold">
                  {tier.price}
                  <span className="text-muted-foreground text-lg font-normal">
                    {tier.price !== "$0" && "/month"}
                  </span>
                </p>
                {tier.yearlyPrice && (
                  <p className="text-muted-foreground mb-4 text-sm">{tier.yearlyPrice}/year</p>
                )}
                <ul className="space-y-2">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="text-primary mr-2 h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex flex-col gap-2">
                {!isPaid ? (
                  <Button className="w-full" variant="outline" disabled>
                    Free plan is always available
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full"
                      disabled={
                        Boolean(pendingCheckout) || isChanging || isActiveMonthly || isLoading
                      }
                      variant={tier.highlighted ? "default" : "outline"}
                      onClick={() => void handlePlanAction(tier.code, "MONTHLY")}
                    >
                      {(pendingCheckout === `${tier.code}-MONTHLY` ||
                        pendingChangeKey === `${tier.code}-MONTHLY`) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isActiveMonthly ? "Current monthly plan" : "Choose monthly"}
                    </Button>
                    <Button
                      className="w-full"
                      disabled={
                        Boolean(pendingCheckout) || isChanging || isActiveYearly || isLoading
                      }
                      variant="outline"
                      onClick={() => void handlePlanAction(tier.code, "YEARLY")}
                    >
                      {(pendingCheckout === `${tier.code}-YEARLY` ||
                        pendingChangeKey === `${tier.code}-YEARLY`) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isActiveYearly ? "Current yearly plan" : "Choose yearly"}
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {pendingServerChange && (
        <Card className="mx-auto w-full max-w-2xl border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" /> Scheduled change
            </CardTitle>
            <CardDescription>
              Your current plan stays active until{" "}
              {formatChangeDate(pendingServerChange.effectiveAt)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {pendingServerChange.changeType.toLowerCase()} to {pendingServerChange.plan}{" "}
              {formatTerm(pendingServerChange.term)} on{" "}
              {formatChangeDate(pendingServerChange.effectiveAt)}.
            </p>
          </CardContent>
        </Card>
      )}
      {hasPaidSubscription && (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" /> Manage subscription
            </CardTitle>
            <CardDescription>
              Cancel your active paid subscription. Your current plan will refresh after backend
              confirms the change.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="destructive"
              disabled={isCancelling}
              onClick={() => setIsCancelConfirmOpen(true)}
            >
              Cancel subscription
            </Button>
          </CardFooter>
        </Card>
      )}
      <Dlg.Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <Dlg.DialogPopup>
          <Dlg.DialogHeader>
            <Dlg.DialogTitle>Cancel subscription?</Dlg.DialogTitle>
            <Dlg.DialogDescription>
              Please confirm that you want to cancel your active paid subscription.
            </Dlg.DialogDescription>
          </Dlg.DialogHeader>
          <Dlg.DialogPanel>
            <p className="text-sm leading-6">
              Your workspace will refresh its billing state after the backend confirms the
              cancellation.
            </p>
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Button
              disabled={isCancelling}
              variant="secondary"
              onClick={() => setIsCancelConfirmOpen(false)}
            >
              Keep subscription
            </Button>
            <Button
              disabled={isCancelling}
              variant="destructive"
              onClick={() => void handleCancelSubscription()}
            >
              {isCancelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm cancellation
            </Button>
          </Dlg.DialogFooter>
        </Dlg.DialogPopup>
      </Dlg.Dialog>
      <Dlg.Dialog open={Boolean(changePreview)} onOpenChange={closeChangePreview}>
        <Dlg.DialogPopup>
          <Dlg.DialogHeader>
            <Dlg.DialogTitle>Confirm plan change</Dlg.DialogTitle>
            <Dlg.DialogDescription>
              Review how this subscription change will be applied before confirming.
            </Dlg.DialogDescription>
          </Dlg.DialogHeader>
          <Dlg.DialogPanel>
            {changePreview && (
              <div className="space-y-3 text-sm">
                <p>
                  {changePreview.currentPlan} {formatTerm(changePreview.currentTerm)} to{" "}
                  {changePreview.targetPlan} {formatTerm(changePreview.targetTerm)}
                </p>
                <p>
                  Change type: <strong>{changePreview.changeType.toLowerCase()}</strong>
                </p>
                <p>
                  Effective:{" "}
                  <strong>
                    {changePreview.effectiveAt === "immediate"
                      ? "immediately"
                      : formatChangeDate(changePreview.effectiveAt)}
                  </strong>
                </p>
                {changePreview.effectiveAtDate && (
                  <p>Effective date: {formatChangeDate(changePreview.effectiveAtDate)}</p>
                )}
                {changePreview.changeType === "UPGRADE" && (
                  <p className="text-muted-foreground">
                    Stripe proration will be applied for this upgrade.
                  </p>
                )}
              </div>
            )}
          </Dlg.DialogPanel>
          <Dlg.DialogFooter>
            <Button disabled={isConfirmingChange} variant="secondary" onClick={closeChangePreview}>
              Cancel
            </Button>
            <Button disabled={isConfirmingChange} onClick={() => void handleConfirmChange()}>
              {isConfirmingChange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm change
            </Button>
          </Dlg.DialogFooter>
        </Dlg.DialogPopup>
      </Dlg.Dialog>
    </div>
  );
};

export default Index;
