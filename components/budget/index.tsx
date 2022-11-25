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
    console.log(date);
  }

  return (
    <>
      <Toolbar sx={{ pb: 1 }}>
        <Typography variant="h4" sx={{ my: 2 }}>Budget</Typography>
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
      <Grid container spacing={1}>
        <Grid item xs={3}>Weekly Summary</Grid>
        <Grid item xs={4}>
          <ButtonGroup
            disableElevation
            size="large"
            aria-label="outlined primary button group"
            sx={{ fontSize: '20px' }}
          >
            <Button
              variant="contained"
              onClick={() => setActiveType('month')}
              size="large"
              sx={{ width: 180, borderRadius: 8 }}
            >
              <Typography
                variant="h5"
                sx={activeType === "month" ? {
                  backgroundColor: "white",
                  color: "primary.main",
                  borderRadius: 5,
                  width: '100%',
                } : {}}
              >
                Monthly
              </Typography>
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveType('week')}
              size="large"
              sx={{ width: 180, borderRadius: 8 }}
            >
              <Typography
                variant="h5"
                sx={activeType === "week" ? {
                  backgroundColor: "white",
                  color: "primary.main",
                  borderRadius: 5,
                  width: '100%',
                } : {}}
              >
                Weekly
              </Typography>
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={2}>
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
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </>
  )
}

export default Index;
