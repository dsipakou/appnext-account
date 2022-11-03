import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Button, Grid, Paper, Toolbar, Typography, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem } from '@mui/material';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { selectCategoryByUuid, selectChildrenCategories, selectParentCategories } from '../../features/categories/categoriesSlice'

const Category = () => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const router = useRouter();
  const { uuid } = router.query;
  const category = useSelector((state: any) => selectCategoryByUuid(state, uuid));
  const childrenCategories = useSelector((state: any) => selectChildrenCategories(state, uuid));
  const allParentCategories = useSelector((state: any) => selectParentCategories(state))

  const editCategoryClick = (editedCategory: any) => {
    setOpen(true);
    setActiveCategory(editedCategory);
  }

  const handleClose = () => {
    setOpen(false);
    setActiveCategory(null);
  };

  const childCard = (category: any) => (
    <Paper variant="outlined">
      <Grid container>
        <Grid item xs={4}></Grid>
        <Grid item xs={4} alignSelf="center">
          <Typography align="center" variant="h6">
            {category.name}
          </Typography>
        </Grid>
        <Grid item xs={4}>
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
      <Toolbar>
        <Link href="/categories">
          Go back
        </Link>
      </Toolbar>
      <Grid container spacing={2}>
        <Grid item xs={12}>
        { category &&
          <Paper variant="outlined">
            <Grid container>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography align="center" variant="subtitle1">Parent category</Typography>
                  <Typography align="center" variant="h3">{category.name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
                  <Button>Edit</Button>
                  <Button>Delete</Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        }
        </Grid>
        {childrenCategories.map((item: any) => <Grid item xs={12}>{childCard(item)}</Grid>)}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Category name"
            type="text"
            fullWidth
            variant="standard"
            value={activeCategory?.name}
          />
          <Select
            margin="dense"
            variant="standard"
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={activeCategory?.parent}
            label="Age"
            onChange={() => {}}
          >
            {allParentCategories.map((item: any) => (
              <MenuItem value={item.uuid} key={item}>{item.name}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Category;