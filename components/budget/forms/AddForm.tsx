import { useSession } from "next-auth/react";
import React, { FC, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import * as z from "zod";

import { formSchema, type FormValues } from "@/components/budget/types";
import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { type FormErrors } from "@/components/ui/form";
import { toastManager } from "@/components/ui/toast";
import { useCreateBudget } from "@/hooks/budget";
import { useCurrencies } from "@/hooks/currencies";
import { useUsers } from "@/hooks/users";
import { getFormattedDate } from "@/utils/dateUtils";

import GenericForm from "./GenericForm";

interface Types {
  date?: Date;
  customTrigger?: React.ReactElement;
}

const AddForm: FC<Types> = ({ date, customTrigger }) => {
  const { mutate } = useSWRConfig();

  const [open, setOpen] = useState(false);
  const [isSomeDay, setIsSomeDay] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: session } = useSession();
  const authUser = session?.user;

  const { data: users = [] } = useUsers();
  const { data: currencies = [] } = useCurrencies();

  const { trigger: createBudget, isMutating: isCreating } = useCreateBudget();

  const getDefaultCurrency = (): string => {
    const currency = currencies.find((item) => item.isDefault);

    return currency?.uuid || "";
  };

  const getDefaultUser = (): string => {
    if (!authUser) {
      return "";
    }

    const user = users.find((item) => item.username === authUser.username);

    return user?.uuid || "";
  };

  const getFormDefaults = (): FormValues => ({
    title: "",
    amount: 0,
    currency: getDefaultCurrency(),
    user: getDefaultUser(),
    category: "",
    repeatType: "",
    numberOfRepetitions: undefined,
    budgetDate: date || new Date(),
    description: "",
  });

  const [values, setValues] = useState<FormValues>(getFormDefaults());

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues((current) => ({
      ...current,
      budgetDate: date || new Date(),
    }));
  }, [date, open]);

  useEffect(() => {
    const defaultCurrency = getDefaultCurrency();

    if (defaultCurrency) {
      setValues((current) =>
        current.currency
          ? current
          : {
              ...current,
              currency: defaultCurrency,
            },
      );
    }
  }, [currencies]);

  useEffect(() => {
    const defaultUser = getDefaultUser();

    if (defaultUser) {
      setValues((current) =>
        current.user
          ? current
          : {
              ...current,
              user: defaultUser,
            },
      );
    }
  }, [authUser, users]);

  const clean = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrors({});
      setValues(getFormDefaults());
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

    try {
      await createBudget({
        ...result.data,
        recurrent: result.data.repeatType,
        budgetDate: isSomeDay ? null : getFormattedDate(result.data.budgetDate),
        numberOfRepetitions: result.data.numberOfRepetitions ?? null,
      });

      mutate((key) => typeof key === "string" && key.includes("budget/usage"), undefined);

      mutate((key) => typeof key === "string" && key.includes("budget/weekly-usage"), undefined);

      mutate("budget/pending/");

      clean(false);

      toastManager.add({
        id: "budget-create",
        title: "Saved!",
        description: "Your budget has been created successfully.",
        type: "success",
      });
    } catch {
      toastManager.add({
        id: "budget-create-error",
        title: "Something went wrong",
        description: "Please, check your fields for errors and try again.",
        type: "error",
      });
    }
  };

  const defaultTrigger = <Button className="mx-2">+ Add budget</Button>;

  return (
    <Dlg.Dialog onOpenChange={clean} open={open} modal={false}>
      <Dlg.DialogTrigger render={customTrigger || defaultTrigger} />

      <Dlg.DialogPopup className="min-w-3xl">
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Add budget</Dlg.DialogTitle>
        </Dlg.DialogHeader>

        <GenericForm
          values={values}
          setValues={setValues}
          errors={errors}
          isLoading={isCreating}
          isSomeDay={isSomeDay}
          setIsSomeDay={setIsSomeDay}
          onSubmit={handleSubmit}
        />
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default AddForm;
