import { FC } from 'react';
import { Box, Button, Toolbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Index: FC = () => {
  return (
    <>
      <Toolbar sx={{ pb: 4 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Currencies</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          sx={{ textTransform: 'none' }}
          onClick={() => { }}
        >
          Add currency
        </Button>
      </Toolbar>
    </>
  )
}

export default Index;
