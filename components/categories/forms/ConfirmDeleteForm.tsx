import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import axios from 'axios';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { useToast } from '@/components/ui/use-toast'
import { CategoryResponse, useCategories } from '../../../hooks/categories';

interface Types {
  uuid: string,
}

const ConfirmDeleteForm: React.FC<Types> = ({ uuid }) => {
  const [category, setCategory] = React.useState<CategoryResponse>();
  const [open, setOpen] = React.useState<boolean>(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { toast } = useToast()

  const { data: categories } = useCategories();
  const { uuid: queryUuid } = router.query;

  React.useEffect(() => {
    if (!categories) return;

    const _category = categories.find((category: CategoryResponse) => category.uuid === uuid);
    if (_category) {
      setCategory(_category)
    }

  }, [categories, uuid])

  const handleDelete = () => {
    setIsLoading(true)
    axios
      .delete(`categories/${category!.uuid}`)
      .then(
        res => {
          if (res.status === 204) {
            if (category!.uuid === queryUuid) {
              router.push('/categories/');
            }
            mutate('categories/');
            setOpen(false)
            toast({
              title: `Category '${category?.name}' deleted!`
            })
          } else {
            // TODO: handle errors [non-empty parent,]
          }
        }
      )
      .catch(
        (err) => {
          toast({
            variant: 'destructive',
            title: 'Something went wrong'
          })
        }
      )
      .finally(
        () => {
          setIsLoading(false)
        }
      );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Please, confirm deletion</DialogTitle>
        <p className="leading-7">
          You are about to delete '{category?.name}' category
        </p>
        <DialogFooter>
          <Button disabled={isLoading} variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={isLoading} variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmDeleteForm;
