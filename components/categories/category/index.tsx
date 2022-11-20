import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Paper,
  Toolbar,
  Typography,
  MenuItem
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Link from 'next/link';
import { useCategories } from '../../../hooks/categories';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditForm from '../forms/EditForm';
import ConfirmDeleteForm from '../forms/ConfirmDeleteForm';
import { Category } from '../types';

const Category = () => {
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [isDeleteFormOpen, setIsDeleteFormOpen] = useState<boolean>(false);
  const [parentCategory, setParentCategory] = useState<Category>();
  const [childrenCategories, setChildrenCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>();

  const { data: categories, isLoading, isError } = useCategories();
  const router = useRouter();
  const { uuid: parentUuid } = router.query;

  useEffect(() => {
    if (isLoading) return;

    const parentCategory = categories.find((item: Category) => item.uuid === parentUuid);
    const childrenCategories = categories.filter((item: Category) => item.parent === parentCategory?.uuid);

    setParentCategory(parentCategory);
    setChildrenCategories(childrenCategories);
  }, [categories, parentUuid, isLoading]);

  const editCategoryClick = (category: Category) => {
    setActiveCategory(category)
    setIsEditFormOpen(true);
  };

  const handleClose = () => {
    setIsEditFormOpen(false);
    setIsDeleteFormOpen(false);
  };

  const handleDelete = (category: Category) => {
    setActiveCategory(category)
    setIsDeleteFormOpen(true);
  };

  const categoryCard = (category: Category) => {
    const isParent = category.parent === null;

    return (
      <Paper
        elevation={isParent ? 3 : 0}
        sx={isParent ? { backgroundColor: 'primary.light', color: 'white' } : {}}
        variant={!isParent ? 'outlined' : 'elevation'}
      >
        <Grid container alignItems="center">
          <Grid item xs={2}>
          </Grid>
          <Grid item xs={8}>
            {isParent ? (
              <>
                <Typography align="center" variant="h3">{category.name}</Typography>
              </>
            ) : (
              <Typography align="center" variant="h6">
                {category.name}
              </Typography>
            )}
          </Grid>
          <Grid item xs={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <Button
                sx={isParent ? { color: 'white' } : {}}
                onClick={() => editCategoryClick(category)}
              >
                Edit
              </Button>
              <Button
                sx={isParent ? { color: 'white' } : {}}
                onClick={() => handleDelete(category)}
              >
                Delete
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    )
  }

  return (
    <>
      <Toolbar sx={{ mb: 4, py: 2 }}>
        <Link href="/categories">
          <Button
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            xs={{ textTransform: 'none' }}
          >
            Go back
          </Button>
        </Link>
      </Toolbar>
      <Stack justifyContent="center" spacing={2}>
        {parentCategory && categoryCard(parentCategory)}
        {childrenCategories.map((item: Category) => <Box key={item.uuid}>{categoryCard(item)}</Box>)}
      </Stack>
      <EditForm open={isEditFormOpen} uuid={activeCategory?.uuid} handleClose={handleClose} />
      <ConfirmDeleteForm open={isDeleteFormOpen} uuid={activeCategory?.uuid} handleClose={handleClose} />
    </>
  )
}

export default Category;
