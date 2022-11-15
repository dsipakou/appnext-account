import PropTypes from 'prop-types';
import { FC, useState } from 'react';

// material-ui
import { styled, useTheme } from '@mui/material/styles';
import { Avatar, Box, Card, Grid, Menu, MenuItem, Typography } from '@mui/material';

// assets
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import GetAppTwoToneIcon from '@mui/icons-material/GetAppOutlined';
import FileCopyTwoToneIcon from '@mui/icons-material/FileCopyOutlined';
import PictureAsPdfTwoToneIcon from '@mui/icons-material/PictureAsPdfOutlined';
import ArchiveTwoToneIcon from '@mui/icons-material/ArchiveOutlined';

interface Types {
  title: string,
  sign: string
  code: string,
  amount: number,
  percentage: number,
}

const CardWrapper = styled(Card)(({ theme, selected }) => ({
  backgroundColor: selected ? theme.palette.primary.dark : 'white',
  color: selected ? 'white' : 'black',
  borderRadius: 15,
  overflow: 'hidden',
  position: 'relative',
  width: 270,
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
    }
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
    }
  }
}));


const CurrencyCard: FC<Types> = ({ title, sign, code, amount, percentage }) => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(false);

  const handleClick = (event) => {
    setSelected(!selected);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <CardWrapper border={false} content={false} selected={selected} raised={!selected} onClick={handleClick}>
        <Box sx={{ p: 2.25 }}>
          <Grid container direction="column">
            <Grid item>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography sx={{ fontSize: '1.5rem' }}>
                    {code}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container alignItems="center">
                <Grid item>
                  <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75 }}>
                    {amount}
                  </Typography>
                </Grid>
              </Grid>
              <Typography>{percentage}</Typography>
            </Grid>
            <Grid item>
            </Grid>
            <Grid item sx={{ mb: 1.25 }}>
              <Typography
                sx={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: theme.palette.secondary[200]
                }}
              >
                {title}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    </>
  );
};

export default CurrencyCard;
