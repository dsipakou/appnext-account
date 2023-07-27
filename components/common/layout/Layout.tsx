import React, { FC, ReactElement, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Link from 'next/link'
import { User2 } from 'lucide-react'
import { styled, Theme, CSSObject } from '@mui/material/styles'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material'
import AppBar from '@mui/material/AppBar'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import CategoryIcon from '@mui/icons-material/Category'
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import MenuIcon from '@mui/icons-material/Menu'
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
  const [open, setOpen] = React.useState(false)
  const { data: currencies } = useCurrencies()
  const { data: { user }, update: updateSession } = useSession()

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleCurrencyChange = (currencyCode: string) => {
    if (currencyCode !== user.currency) {
      axios.patch('users/currency/', {
        currency: currencyCode
      }).then(
        res => {
          if (res.status === 200) {
            // TODO: Remove this after migrating to session
            // updateCurrency(currencyCode)
            updateSession({ currency: currencyCode })
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

  const bottomMenuItems = [
    {
      name: 'Users',
      icon: <User2 />,
      link: '/users/'
    },
  ]

  const menuComponent = (name: string, icon: ReactElement, link: string): ReactElement => (
    <ListItem onClick={handleDrawerClose} key={name} disablePadding sx={{ display: 'block' }}>
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-blue-500 text-white">
        <div className="flex mx-2 py-2 items-center">
          <Button
            variant="link"
            className="text-white"
            onClick={open ? handleDrawerClose : handleDrawerOpen}
          >
            <MenuIcon />
          </Button>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Flying Budget
          </Typography>
          <div className="flex w-80">
            <Select
              defaultValue={user.currency}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="flex bg-white w-full pt-1" position="popper">
                <SelectGroup>
                  <SelectLabel>Displayed currency</SelectLabel>
                  {currencies && currencies.map((item: Currency) => (
                    <SelectItem key={item.code} value={item.code}>{item.verbalName}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <span className="mx-4">Hello, {user.username}</span>
          <Link href="/logout"><span className="mr-4">Logout</span></Link>
        </div>
      </header>
      <div className={`drop-shadow-sm transition-all ease-in-out delay-50 fixed bg-white overflow-hidden h-screen ${open ? 'w-60' : 'w-16'}`}>
        <StyledList>
          {menuItems.map(({ name, icon, link }) => (
            <Box key={name}>
              {menuComponent(name, icon, link)}
            </Box>
          ))}
        </StyledList>
        <StyledList className="self-end">
          {bottomMenuItems.map(({ name, icon, link }) => (
            <div key={name}>
              {menuComponent(name, icon, link)}
            </div>
          ))}
        </StyledList>
      </div>
      <div className="container mx-auto max-w-screen-xl min-w-screen-lg">
        {children}
      </div>
    </>
  )
}

export default Layout
