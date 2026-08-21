import { Trash } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { useSWRConfig } from "swr";

import { CategoryResponse } from "@/components/categories/types";
import { Button } from "@/components/ui/button";
import * as Dlg from "@/components/ui/dialog";
import { toastManager } from "@/components/ui/toast";
import { useCategories, useDeleteCategory } from "@/hooks/categories";
import { extractErrorMessage } from "@/utils/stringUtils";

interface Types {
  uuid: string;
}

const ConfirmDeleteForm: React.FC<Types> = ({ uuid }) => {
  const [category, setCategory] = React.useState<CategoryResponse>();
  const [open, setOpen] = React.useState<boolean>(false);
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { trigger: deleteCategory, isMutating: isDeleting } = useDeleteCategory(uuid);
  const { uuid: queryUuid } = router.query;

  React.useEffect(() => {
    if (!categories) return;

    const _category = categories.find((category: CategoryResponse) => category.uuid === uuid);
    if (_category != null) {
      setCategory(_category);
    }
  }, [categories, uuid]);

  const handleDelete = async () => {
    try {
      await deleteCategory();
      if (category!.uuid === queryUuid) {
        router.push("/categories");
      }
      mutate("categories/");
      setOpen(false);
      toastManager.add({
        id: "category-delete",
        title: `Category '${category?.name}' deleted!`,
        type: "success",
      });
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message[0].includes("There are transactions assigned")) {
        toastManager.add({
          id: "category-delete-has-transactions",
          title: "This category contains transactions",
          description: "You need to choose different category to re-assign transactions",
          type: "error",
        });
      } else if (message[0].includes("Cannot delete non empty parent category")) {
        toastManager.add({
          id: "category-delete-has-children",
          title: "This parent category contains categories",
          description: "Parent category should be empty to delete it",
          type: "error",
        });
      } else if (message[0].includes("There are budgets assigned")) {
        toastManager.add({
          id: "category-delete-has-budgets",
          title: "This category contains budgets",
          description: "You need to delete or re-assign budgets assigned to the category",
          type: "error",
        });
      } else {
        toastManager.add({
          id: "category-delete-error",
          title: "Something went wrong",
          type: "error",
        });
      }
    }
  };

  return (
    <Dlg.Dialog open={open} onOpenChange={setOpen}>
      <Dlg.DialogTrigger render={<Button variant="ghost" />}>
        <Trash className="h-5 w-5 text-red-500" />
      </Dlg.DialogTrigger>
      <Dlg.DialogPopup>
        <Dlg.DialogHeader>
          <Dlg.DialogTitle>Please, confirm deletion</Dlg.DialogTitle>
          <Dlg.DialogDescription>
            You are about to delete '{category?.name}' category
          </Dlg.DialogDescription>
        </Dlg.DialogHeader>
        <Dlg.DialogFooter>
          <Dlg.DialogClose render={<Button variant="ghost" />}>Cancel</Dlg.DialogClose>
          <Button disabled={isDeleting} variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </Dlg.DialogFooter>
      </Dlg.DialogPopup>
    </Dlg.Dialog>
  );
};

export default ConfirmDeleteForm;
