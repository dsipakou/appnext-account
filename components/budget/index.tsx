import { useState } from 'react';
import { add } from 'date-fns';
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useUsers } from '@/hooks/users';
import { User } from '@/component/users/types';
import { GeneralSummaryCard, CategorySummaryButton } from './components';

type BudgetType = 'month' | 'week'

const Index = () => {
  const [user, setUser] = useState<string>('all');
  const [date, setDate] = useState<Date>(new Date());
  const [activeType, setActiveType] = useState<BudgetType>('month');
  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useUsers();

  const maxDate = add(new Date(), { years: 2 });

  const changeUser = (e: SelectChangeEvent): void => {
    setUser(e.target.value);
  }

  const onDateChange = (date: Date): void => {
    setDate(date);
  }

  const toolbar = (
    <Toolbar sx={{ pb: 1 }}>
      <Typography variant="h4" sx={{ my: 2 }}>Budget</Typography>
      <Box sx={{ flexGrow: 1 }} />
      <ButtonGroup
        disableElevation
        size="large"
        aria-label="outlined primary button group"
        sx={{ backgroundColor: "primary.main" }}
      >
        <Button
          disabled={activeType === 'month'}
          variant={activeType === 'month' ? "text" : "contained"}
          onClick={() => setActiveType('month')}
          sx={{ width: 180, p: 0 }}
        >
          <Typography
            variant="h5"
            sx={activeType === "month" ? {
              display: 'flex',
              justifyContent: 'center',
              color: "primary.main",
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Monthly
          </Typography>
        </Button>
        <Button
          disabled={activeType === 'week'}
          variant={activeType === 'week' ? "text" : "contained"}
          onClick={() => setActiveType('week')}
          sx={{ width: 180, p: 0 }}
        >
          <Typography
            variant="h5"
            sx={activeType === "week" ? {
              display: 'flex',
              justifyContent: 'center',
              color: "primary.main",
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Weekly
          </Typography>
        </Button>
      </ButtonGroup>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        startIcon={<AddIcon />}
        variant="contained"
        sx={{ textTransform: 'none' }}
        onClick={() => { }}
      >
        Add budget
      </Button>
    </Toolbar>
  )

  const header = (
    <Grid container spacing={3} alignItems="center">
      <Grid item xs={4}>
        <GeneralSummaryCard />
      </Grid>
      <Grid item xs={2}>
      </Grid>
      <Grid item xs={3}>
        <FormControl fullWidth>
          <InputLabel id="user-select-label">User</InputLabel>
          <Select
            labelId="user-select-label"
            label="Type"
            fullWidth
            value={user}
            onChange={changeUser}
          >
            <MenuItem value="all">All</MenuItem>
            {!isUsersLoading && users.map((item: User) => (
              <MenuItem value={item.uuid} key={item.uuid}>{item.username}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={3}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            views={['year', 'month']}
            label="Budget month"
            openTo="month"
            date={date}
            maxDate={maxDate}
            onChange={(newDate: Date) => { onDateChange(newDate) }}
            renderInput={(params) => <TextField fullWidth {...params} helperText={null} />}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  );

  return (
    <>
      {toolbar}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {header}
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Stack spacing={2}>
                <CategorySummaryButton />
                <CategorySummaryButton />
                <CategorySummaryButton />
                <CategorySummaryButton />
                <CategorySummaryButton />
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default Index;
