import React, { FC, ReactElement, ReactNode } from 'react'
import axios from 'axios'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { styled, Theme, CSSObject } from '@mui/material/styles'
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar,
  Container,
  Typography
} from '@mui/material'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CategoryIcon from '@mui/icons-material/Category'
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import { useAuth } from '@/context/auth'
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '@/components/currencies/types'

const drawerWidth = 250

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

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
})

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
)

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}))

const StyledList = styled(List)(({ theme }) => ({
  padding: theme.spacing(1, 0),
}))

type Props = {
  children: ReactNode,
}

const Layout: FC<Props> = ({ children }) => {
  const theme = useTheme()
  const router = useRouter()
  const { isAuthenticated, user, loading, updateCurrency } = useAuth()
  const [open, setOpen] = React.useState(false)
  const {
    data: currencies,
    isLoading: isCurrenciesLoading
  } = useCurrencies()

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  React.useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [loading])

  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value

    if (selectedCurrency !== user.currency) {
      axios.patch('users/currency/', {
        currency: selectedCurrency
      }).then(
        res => {
          if (res.status === 200) {
            console.log(selectedCurrency)
            updateCurrency(selectedCurrency)
            // TODO: mutate something
          }
        }
      ).catch(
        (error) => {
          const errRes = error.response.data
        }
      )
    }
  }

  if (!isAuthenticated) {
    return (
      <Container fixed maxWidth="lg">
        {children}
      </Container>
    )
  }

  if (loading) {
    return
  }

  const menuItems = [
    {
      name: 'Accounts',
      icon: <CreditCardIcon />,
      link: '/accounts/'
    },
    {
      name: 'Transactions',
      icon: <ReceiptLongIcon />,
      link: '/transactions/'
    },
    {
      name: 'Categories',
      icon: <CategoryIcon />,
      link: '/categories/'
    },
    {
      name: 'Budget',
      icon: <OnlinePredictionIcon />,
      link: '/budget/month',
    },
    {
      name: 'Currencies',
      icon: <CurrencyExchangeIcon />,
      link: '/currencies/'
    },
    {
      name: 'Reports',
      icon: <ShowChartIcon />,
      link: '/reports/'
    },
  ]

  const menuComponent = (name: string, icon: ReactElement, link: string): ReactElement => (
    <ListItem key={name} disablePadding sx={{ display: 'block' }}>
      <Link href={link}>
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
            {icon}
          </ListItemIcon>
          <ListItemText primary={name} sx={{ opacity: 1 }} />
        </ListItemButton>
      </Link>
    </ListItem>
  )

  const appBar = {
    position: 'fixed',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    }
  }

  return (
    <>
      <AppBarStyled {...appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flying Budget
          </Typography>
          <Select
            size="small"
            value={user.currency}
            onChange={handleCurrencyChange}
            sx={{
              backgroundColor: 'white',
              width: '200px'
            }}
          >
            {currencies && currencies.map((item: Currency) => (
              <MenuItem key={item.code} value={item.code}>{item.verbalName}</MenuItem>
            ))}
          </Select>
          {isAuthenticated && (
            <Typography variant="text" sx={{ mx: 2 }}>Hello, {user.username}</Typography>
          )}
          {!loading && !isAuthenticated
            ? <Link href="/login" color="inherit">Login</Link>
            : <Link href="/logout"><Typography variant="">Logout</Typography></Link>
          }
        </Toolbar>
      </AppBarStyled>
      <StyledDrawer
        variant="permanent"
        open={open}
      >
        <Toolbar />
        <StyledList>
          {menuItems.map(({ name, icon, link }) => (
            <Box key={name}>
              {menuComponent(name, icon, link)}
            </Box>
          ))}
        </StyledList>
      </StyledDrawer>
      <Container fixed maxWidth="lg">
        {children}
      </Container>
    </>
  )
}

export default Layout
