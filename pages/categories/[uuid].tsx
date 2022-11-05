import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Grid, Paper, Toolbar, Typography, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Link from 'next/link';
import { selectCategoryByUuid, selectChildrenCategories, selectParentCategories } from '../../features/categories/categoriesSlice'
import { useCategories } from '../../hooks/categories';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Category = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [editParent, setEditParent] = useState(null);
  const [category, setCategory] = useState();
  const [childrenCategories, setChildrenCategories] = useState([]);
  const [allParentCategories, setAllParentCategories] = useState([]);

  const { categories, isLoading, isError } = useCategories();
  const router = useRouter();
  const { uuid } = router.query;

  useEffect(() => {
    if (isLoading) return;

    const category = categories.find((item: any) => item.uuid === uuid);
    const childrenCategories = categories.filter((item: any) => item.parent === category.uuid);
    const parentCategories = categories.filter((item: any) => item.parent === null);

    setCategory(category);
    setChildrenCategories(childrenCategories);
    setAllParentCategories(parentCategories);
  }, [categories, uuid, isLoading]);

  const editCategoryClick = (editedCategory: any) => {
    setOpen(true);
    setActiveCategory(editedCategory);
    setEditParent(category);
  };

  const handleClose = () => {
    setOpen(false);
    setActiveCategory(null);
    setEditParent(null);
  };

  const handleChange = (event: SelectChangeEvent) => {
    console.log('here');
    setEditParent(event.target.value);
  }

  const childCard = (category: any) => (
    <Paper variant="outlined">
      <Grid container>
        <Grid item xs={2}></Grid>
        <Grid item xs={8} alignSelf="center">
          <Typography align="center" variant="h6">
            {category.name}
          </Typography>
        </Grid>
        <Grid item xs={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
            <Button onClick={() => editCategoryClick(category)}>Edit</Button>
            <Button>Delete</Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )

  return (
    <>
      <Toolbar sx={{mb: 4, py: 2}}>
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
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={8}>
        { category &&
          <Paper elevation={3}>
            <Grid container>
              <Grid item xs={2}></Grid>
              <Grid item xs={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography align="center" variant="subtitle1">Parent category</Typography>
                  <Typography align="center" variant="h3">{category.name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                  <Button>Edit</Button>
                  <Button>Delete</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        }
        </Grid>
        {childrenCategories.map((item: any) => <Grid item xs={8} key={item.uuid}>{childCard(item)}</Grid>)}
      </Grid>
      <Dialog open={open} maxWidth="sm" fullWidth={true} onClose={handleClose}>
        <DialogTitle>Edit category</DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <Select
                label="Parent"
                fullWidth
                value={editParent}
                onChange={handleChange}
              >
                {allParentCategories.map((item: any) => (
                  <MenuItem value={item.uuid} key={item.uuid}>{item.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Category name"
                type="text"
                fullWidth
                value={activeCategory?.name}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Category;
