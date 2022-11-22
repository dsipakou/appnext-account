import PropTypes from 'prop-types';
import { FC, useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Button, Box, Card, Grid, Menu, MenuItem, Typography } from '@mui/material';

// assets
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { getRelativeDate } from '@/utils/dateUtils';

import { Currency, Rate } from './types';

interface Types {
  currency: Currency,
  rates: Rate[],
  selectCurrency: (code: string) => void,
  unselectCurrency: (code: string) => void,
  handleDeleteClick: () => void,
  handleEditClick: () => void,
}

const CardWrapper = styled(Card)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.dark : 'white',
  color: selected ? 'white' : 'black',
  borderRadius: 15,
  overflow: 'hidden',
  position: 'relative',
  width: 270,
  height: 190,
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary.light,
    borderRadius: '50%',
    top: -85,
    right: -95,
    opacity: 0.7,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    },
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary.light,
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.3,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70
    },
  }
}));


const CurrencyCard: FC<Types> = ({
  currency,
  rates,
  selectCurrency,
  unselectCurrency,
  handleDeleteClick,
  handleEditClick,
}) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState<boolean>(false);

  const getRate = (uuid: string, seqNumber: number = 0): Rate | undefined => {
    if (!rates) {
      return;
    }

    const currencyRates: Rate[] = rates.filter(
      (rate: Rate) => rate.currency === uuid
    )
    if (currencyRates.length < 2) {
      return currencyRates[0];
    }

    return currencyRates[seqNumber];
  }

  const getPercentage = (uuid: string): number => {
    if (!rates) {
      return 0;
    }

    const _rates: Rate[] = rates.filter((rate: Rate) => rate.currency === uuid);
    if (_rates.length < 2) {
      return 0;
    }

    return (1 - (_rates[1].rate / _rates[0].rate)) * 100;
  }

  const getDate = (currencyUuid: string | undefined): string => {
    const date = getRate(currencyUuid)?.rateDate;
    if (date === undefined) return '';

    return getRelativeDate(date);
  }

  const handleOpenMenu = (e: MouseEvent): void => {
    setAnchorEl(e.currentTarget);
    e.stopPropagation();
  }

  const handleCloseMenu = (e: MouseEvent): void => {
    setAnchorEl(null);
    e.stopPropagation();
  }

  const handleDelete = (e: MouseEvent): void => {
    handleCloseMenu(e);
    handleDeleteClick(currency.uuid);
  }

  const handleEdit = (e: MouseEvent): void => {
    handleCloseMenu(e);
    handleEditClick(currency.uuid);
  }

  const handleClick = (): void => {
    setSelected(!selected);

    if (selected) {
      unselectCurrency(currency.code);
    } else {
      selectCurrency(currency.code)
    }
  };

  const test = () => {
    console.log('click')
  }

  return (
    <>
      <CardWrapper
        selected={selected}
        raised={!selected}
        onClick={handleClick}
      >
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid container justifyContent="space-between">
                <Grid item xs={10}>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {currency.code}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Avatar
                    sx={{
                      backgroundColor: 'white',
                      color: theme.palette.primary.light,
                      zIndex: 1
                    }}
                    aria-controls="menu-earning-card"
                    aria-haspopup="true"
                    onClick={handleOpenMenu}
                  >
                    <MoreHorizIcon fontSize="inherit" />
                  </Avatar>
                  <Menu
                    id="menu-earning-card"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    variant="selectedMenu"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right'
                    }}
                  >
                    <MenuItem onClick={handleEdit}>
                      <EditIcon sx={{ mr: 1.75 }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                      <DeleteIcon sx={{ mr: 1.75 }} /> Delete
                    </MenuItem>
                  </Menu>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="baseline">
                <Grid item>
                  <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75 }}>
                    {getRate(currency.uuid)?.rate.toFixed(4)}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 500, mr: 1 }}>
                    {getRate(currency.uuid, 1)?.rate.toFixed(4)}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container alignItems="center" gap={1}>
                <Grid item>
                  <Typography>
                    {getPercentage(currency.uuid)?.toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography sx={{ fontSize: '.9rem' }}>
                    ({(getRate(currency.uuid)?.rate - getRate(currency.uuid, 1)?.rate).toFixed(4)})
                  </Typography>
                </Grid>
                <Grid item>
                  {getPercentage(currency.uuid) < 0 && <SouthEastIcon sx={{ color: 'red' }} />}
                  {getPercentage(currency.uuid) > 0 && <NorthEastIcon sx={{ color: 'lightgreen' }} />}
                </Grid>
              </Grid>
            </Grid>
            <Grid item sx={{ mb: 1.25, selfAlign: "flex-end" }}>
              <Typography
                sx={{
                  fontSize: '.8rem',
                  fontWeight: 500,
                  color: theme.palette.secondary[200],
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                {getDate(currency.uuid)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    </>
  );
};

export default CurrencyCard;
