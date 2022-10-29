import React, { FC, ReactElement } from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import AppBar, { AppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CategoryIcon from '@mui/icons-material/Category';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 320;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(9, 0),
}));


type Props = {};

const Layout: FC<Props> = (props) => {
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const menuItems = [
    {
      name: 'Accounts',
      icon: <CreditCardIcon />,
    },
    {
      name: 'Transactions',
      icon: <ReceiptLongIcon />,
    },
    {
      name: 'Categories',
      icon: <CategoryIcon />,
    },
    {
      name: 'Budget',
      icon: <OnlinePredictionIcon />,
    },
    {
      name: 'Currencies',
      icon: <CurrencyExchangeIcon />,
    },
    {
      name: 'Reports',
      icon: <ShowChartIcon />,
    },
  ];

  const menuComponent = (name: string, icon: ReactElement): ReactElement => (
    <ListItem key={name} disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        sx={{
          minHeight: 48,
          justifyContent: 'initial',
          px: 2.5,
        }}
      >
        <ListItemIcon
          sx={{
          minWidth: 0,
          mr: 3,
          justifyContent: 'center',
          }}
        >
          { icon }
        </ListItemIcon>
        <ListItemText primary={name} sx={{ opacity: 1 }} />
      </ListItemButton>
    </ListItem>
  )

  return (
    <>
      <StyledAppBar>
        <Toolbar position="fixed" open={open}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={ open ? handleDrawerClose : handleDrawerOpen }
            edge="start"
            sx={{
              marginRight: 5,
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer
        variant="permanent"
        open={open}
      >
        <StyledList>
          { menuItems.map(({ name, icon }) => (
            <>
              { menuComponent(name, icon) }
            </>
          ))}
          </StyledList>
      </StyledDrawer>
    </>
  )
};

export default Layout;
