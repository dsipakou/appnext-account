import React from 'react'
import { useRouter } from 'next/router';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@/components/ui/button'
import {
  Paper,
  Toolbar,
  Typography,
} from '@mui/material';
import { useCategories } from '@/hooks/categories';
import EditForm from '../forms/EditForm';
import ConfirmDeleteForm from '../forms/ConfirmDeleteForm';
import { Category } from '../types';

const Category = () => {
  const [parentCategory, setParentCategory] = React.useState<Category>();
  const [childrenCategories, setChildrenCategories] = React.useState<Category[]>([]);

  const { data: categories } = useCategories();

  const router = useRouter();
  const { uuid: parentUuid } = router.query;

  React.useEffect(() => {
    if (!categories) return;

    const parentCategory = categories.find((item: Category) => item.uuid === parentUuid);
    const childrenCategories = categories.filter((item: Category) => item.parent === parentCategory?.uuid);

    setParentCategory(parentCategory);
    setChildrenCategories(childrenCategories);
  }, [categories, parentUuid]);

  const parentCategoryCard = (category: Category) => {
    return (
      <div className="border rounded-md shadow-md bg-white">
        <div className="grid grid-cols-12">
          <div className="col-span-2">
          </div>
          <div className="col-span-8 self-center">
            <Typography align="center" variant="h3">{category.name}</Typography>
          </div>
          <div className="col-span-2">
            <div className="flex flex-col items-end text-white">
              <EditForm uuid={category.uuid} />
              <ConfirmDeleteForm uuid={category.uuid} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const categoryCard = (category: Category) => {
    return (
      <Paper variant="outlined">
        <div className="grid grid-cols-12">
          <div className="col-span-2">
          </div>
          <div className="col-span-8 self-center">
            <div className="text-lg">
              {category.name}
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex flex-col items-end">
              <EditForm uuid={category.uuid} />
              <ConfirmDeleteForm uuid={category.uuid} />
            </div>
          </div>
        </div>
      </Paper>
    )
  }

  return (
    <>
      <Toolbar sx={{ mb: 4, py: 2 }}>
        <Button asChild variant="link">
          <Link href="/categories">
            <ArrowBackIcon className="mr-2" /> Back
          </Link>
        </Button>
      </Toolbar>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3">
          {parentCategory && parentCategoryCard(parentCategory)}
        </div>
        {childrenCategories.map((item: Category) => <div key={item.uuid}>{categoryCard(item)}</div>)}
      </div>
    </>
  )
}

export default Category
