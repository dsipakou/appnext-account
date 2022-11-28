import { SelectChangeEvent, useEffect, useState } from 'react';
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
  Toolbar,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUsers } from '@/hooks/users';
import { useAuth } from '@/context/auth';
import { useBudgetMonth, GroupedByCategoryBudget } from '@/hooks/budget';
import { User } from '@/component/users/types';
import { GeneralSummaryCard } from './components';
import WeekCalendar from '@/components/budget/components/week/WeekCalendar';
import MonthCalendar from '@/components/budget/components/month/MonthCalendar';
import { default as MonthContainer } from './components/month/Container';

type BudgetType = 'month' | 'week'

const Index = () => {
  const { user: userConfig } = useAuth();
  const [user, setUser] = useState<string>('all')
  const [date, setDate] = useState<Date>(new Date())
  const [activeType, setActiveType] = useState<BudgetType>('month')
  const [activeCategory, setActiveCategory] = useState<string>()
  const {
    data: users,
    isLoading: isUsersLoading,
  } = useUsers();
  const {
    data: budgetMonth,
    isLoading: isMonthBudgetLoading
  } = useBudgetMonth("2022-11-01", "2022-11-30");

  useEffect(() => {
    console.log(activeCategory);
  }, [activeCategory]);

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
        {activeType === "month" ?
          <MonthCalendar /> :
          <WeekCalendar />
        }
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
          <MonthContainer />
        </Grid>
      </Grid>
    </>
  )
}

export default Index;
