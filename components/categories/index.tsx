
import { useState } from 'react';
import Button from '@mui/material/Button';
import {
  TextField,
  Toolbar,
  Box,
  Typography,
  Paper,
  Grid,
  Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Category } from './types';
import Link from 'next/link';
import { useCategories } from '../../hooks/categories';
import AddForm from './forms/AddForm';

const Index = () => {
  const [ isOpenAddCategory, setIsOpenAddCategory ] = useState<boolean>(false);
  const { categories, isLoading, isError } = useCategories();

  if (isError) {
    return <div>Error</div>
  }

  let content: Category[] = [];

  const openAddCategoryForm = () => {
    setIsOpenAddCategory(true);
  };

  const closeAddCategoryForm = () => {
    setIsOpenAddCategory(false);
  };

  const parentCategories = (): Category[] => {
    const output = categories.filter((item: Category) => item.parent === null && item.type !== 'INC')
    return output;
  }

  const categoriesByParent = (uuid: string): Category[] => {
    return categories.filter((item: Category) => item.parent === uuid);
  }

  return (
    <>
      <Toolbar sx={{pb: 4}}>
        <Typography variant="h4" sx={{ my: 2 }}>Categories</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={openAddCategoryForm}
        >
            Add category
        </Button>
      </Toolbar>
      <Box>
        <Grid container spacing={2}>
          { isLoading && <Skeleton variant="circular" width={40} height={40} />}
          { !isLoading && parentCategories().map((item: Category) => (
            <Grid item xs={3} key={item.uuid}>
              <Link href={`/categories/${item.uuid}`}>
                <Paper
                  variant="outlined"
                  sx={{ maxWidth: 345, minHeight: 200, maxHeight: 200, overflow: 'hidden', padding: 2 }}
                >
                    <Typography noWrap component="div" variant="h4">{item.name}</Typography>
                    {
                      categoriesByParent(item.uuid).map((category: Category) => (
                        <Typography key={category.uuid} noWrap component="div" variant="body1">
                          {category.name}
                        </Typography>
                      ))
                    }
                </Paper>
              </Link>
            </Grid>
            ))
          }
        </Grid>
      </Box>
      <AddForm open={isOpenAddCategory} handleClose={closeAddCategoryForm} />
    </>
  );
};

export default Index;
