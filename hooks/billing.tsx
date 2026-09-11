import type { KeyedMutator } from "swr";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";

import { fetchReq, postReq } from "@/plugins/axios";

import type { Response } from "./types";

export type BillingPlanCode = "FREE" | "INDIVIDUAL" | "FAMILY";
export type BillingTerm = "MONTHLY" | "YEARLY";

export type BillingEffectivePlan = {
  code: BillingPlanCode;
  name: string;
  maxMembers: number;
};

export type BillingChangeType = "UPGRADE" | "DOWNGRADE";

export type BillingPendingChange = {
  plan: Exclude<BillingPlanCode, "FREE">;
  term: BillingTerm;
  effectiveAt: string;
  changeType: BillingChangeType;
};

export type BillingSubscription = {
  plan: Exclude<BillingPlanCode, "FREE">;
  term: BillingTerm;
  status: string;
  pendingChange?: BillingPendingChange;
};

export type BillingSubscriptionResponse = {
  subscription?: BillingSubscription;
  entitlement: unknown;
  effectivePlan: BillingEffectivePlan;
};

export type BillingCheckoutPayload = {
  plan: Exclude<BillingPlanCode, "FREE">;
  term: BillingTerm;
  successUrl: string;
  cancelUrl: string;
};

export type BillingCheckoutResponse = {
  checkoutUrl: string;
  checkoutSessionId: string;
};

export type BillingChangePayload = {
  plan: Exclude<BillingPlanCode, "FREE">;
  term: BillingTerm;
};

export type BillingChangePreviewResponse = {
  currentPlan: Exclude<BillingPlanCode, "FREE">;
  currentTerm: BillingTerm;
  targetPlan: Exclude<BillingPlanCode, "FREE">;
  targetTerm: BillingTerm;
  changeType: BillingChangeType;
  effectiveAt: string;
  effectiveAtDate?: string;
  prorationBehavior: string;
};

export const BILLING_SUBSCRIPTION_URL = "billing/subscription/";

export const useBillingSubscription = (): Response<BillingSubscriptionResponse> & {
  mutate: KeyedMutator<BillingSubscriptionResponse>;
} => {
  const swrResponse = useSWR<BillingSubscriptionResponse>(BILLING_SUBSCRIPTION_URL, fetchReq);

  return {
    data: swrResponse.data!,
    isLoading: swrResponse.isLoading,
    isError: Boolean(swrResponse.error),
    mutate: swrResponse.mutate,
  };
};

export const useStartBillingCheckout = (): {
  trigger: (payload: BillingCheckoutPayload) => Promise<BillingCheckoutResponse>;
  isMutating: boolean;
} => {
  const { trigger, isMutating } = useSWRMutation("billing/subscription/checkout/", postReq);

  return {
    trigger: trigger as (payload: BillingCheckoutPayload) => Promise<BillingCheckoutResponse>,
    isMutating,
  };
};

export const usePreviewBillingChange = (): {
  trigger: (payload: BillingChangePayload) => Promise<BillingChangePreviewResponse>;
  isMutating: boolean;
} => {
  const { trigger, isMutating } = useSWRMutation("billing/subscription/change/preview/", postReq);

  return {
    trigger: trigger as (payload: BillingChangePayload) => Promise<BillingChangePreviewResponse>,
    isMutating,
  };
};

export const useConfirmBillingChange = (): {
  trigger: (payload: BillingChangePayload) => Promise<BillingSubscriptionResponse>;
  isMutating: boolean;
} => {
  const { trigger, isMutating } = useSWRMutation("billing/subscription/change/confirm/", postReq);

  return {
    trigger: trigger as (payload: BillingChangePayload) => Promise<BillingSubscriptionResponse>,
    isMutating,
  };
};

export const useCancelBillingSubscription = (): {
  trigger: (payload?: unknown) => Promise<unknown>;
  isMutating: boolean;
} => {
  const { trigger, isMutating } = useSWRMutation("billing/subscription/cancel/", postReq);

  return {
    trigger,
    isMutating,
  };
};
