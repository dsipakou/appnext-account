import React, { useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import * as z from "zod";

import { formSchema, type FormValues } from "@/components/budget/types";
import * as Dlg from "@/components/ui/dialog";
import { type FormErrors } from "@/components/ui/form";
import { toastManager } from "@/components/ui/toast";
import { useBudgetDetails, useEditBudget } from "@/hooks/budget";
import { getFormattedDate, parseDate } from "@/utils/dateUtils";
import { extractErrorMessage } from "@/utils/stringUtils";

import GenericForm from "./GenericForm";

interface Types {
  open: boolean;
  setOpen: (open: boolean) => void;
  uuid: string;
}

const EditForm: React.FC<Types> = ({ open, setOpen, uuid }) => {
  const { mutate } = useSWRConfig();

  const [isSomeDay, setIsSomeDay] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [values, setValues] = useState<FormValues>({
    title: "",
    amount: 0,
    currency: "",
    user: "",
    category: "",
    repeatType: "",
    numberOfRepetitions: undefined,
    budgetDate: new Date(),
    description: "",
  });

  const { trigger: editBudget, isMutating: isEditing } = useEditBudget(uuid);

  const { data: budgetDetails } = useBudgetDetails(uuid);

  useEffect(() => {
    if (!open) {
      return;
    }

    setTimeout(() => {
      document.getElementById("title")?.focus();
    }, 100);
  }, [open]);

  useEffect(() => {
    if (!budgetDetails) {
      return;
    }

    setIsSomeDay(!budgetDetails.budgetDate);

    setValues({
      category: budgetDetails.category || "",
      user: budgetDetails.user || "",
      currency: budgetDetails.currency || "",
      amount: budgetDetails.amount ?? 0,
      title: budgetDetails.title || "",
      repeatType: budgetDetails.recurrent || "",
      numberOfRepetitions: budgetDetails.numberOfRepetitions ?? undefined,
      budgetDate: budgetDetails.budgetDate ? parseDate(budgetDetails.budgetDate) : new Date(),
      description: budgetDetails.description || "",
    });
  }, [budgetDetails]);

  const cleanFormErrors = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrors({});

      setValues({
        title: "",
        amount: 0,
        currency: "",
        user: "",
        category: "",
        repeatType: "",
        numberOfRepetitions: undefined,
        budgetDate: new Date(),
        description: "",
      });

      setIsSomeDay(false);
    }

    setOpen(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = formSchema.safeParse(values);

    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setErrors({});

    const budgetData = {
      title: result.data.title,
      amount: result.data.amount,
      currency: result.data.currency,
      user: result.data.user,
      category: result.data.category,
      budgetDate: isSomeDay ? null : getFormattedDate(result.data.budgetDate),
      description: result.data.description,
      recurrent: result.data.repeatType,
      numberOfRepetitions: result.data.numberOfRepetitions ?? null,
    };

    try {
      await editBudget(budgetData);

      mutate((key) => typeof key === "string" && key.includes("budget/usage"), undefined);

      mutate((key) => typeof key === "string" && key.includes("budget/weekly-usage"), undefined);

      mutate("budget/pending/");

      toastManager.add({
        id: "budget-update",
        title: "Successfully updated!",
        description: "Your budget has been updated successfully.",
        type: "success",
      });

      setOpen(false);
    } catch (error) {
      const message = extractErrorMessage(error);

      toastManager.add({
        id: "budget-update-error",
        title: "Cannot be updated",
        description: message,
        type: "error",
      });
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={cleanFormErrors}>
      <Dlg.DialogPopup className="min-w-3xl">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Edit budget</Dlg.DialogTitle>
        </Dlg.DialogHeader>

        <GenericForm
          values={values}
          setValues={setValues}
          errors={errors}
          isLoading={isEditing}
          isSomeDay={isSomeDay}
          setIsSomeDay={setIsSomeDay}
          onSubmit={handleSubmit}
        />
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default React.memo(EditForm);
