import Button from '@mui/material/Button';
import { Toolbar, Box, Typography, Paper, Grid } from '@mui/material';
import { useGetCategoriesQuery } from '../../features/api/apiSlice';
import { Category } from './types';
import Link from 'next/link';

const Index = () => {
  const {
    data: categories,
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetCategoriesQuery();

  let content: Category[] = [];

  const parentCategories = (): Category[] => {
    const output = categories.filter((item: Category) => item.parent === null && item.type !== 'INC')
    return output;
  }

  const categoriesByParent = (uuid: string): Category[] => {
    return categories.filter((item: Category) => item.parent === uuid);
  }

  return (
    <>
      <Toolbar>
        <Typography variant="h4" sx={{ my: 2 }}>Categories</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" sx={{ textTransform: 'none' }}>Add category</Button>
      </Toolbar>
      <Box>
        <Grid container spacing={2}>
          { isSuccess && parentCategories().map((item: Category) => (
            <Grid item xs={3} key={item.uuid}>
              <Link href={`/categories/${item.uuid}`}>
                <Paper
                  variant="outlined"
                  sx={{ maxWidth: 345, minHeight: 200, maxHeight: 200, overflow: 'hidden', padding: 1 }}
                >
                    <Typography component="div" variant="h4">{item.name}</Typography>
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
    </>
  );
};

export default Index;
