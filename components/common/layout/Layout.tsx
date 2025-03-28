'use client'

import React, { FC, ReactElement, ReactNode } from 'react'
import { useSWRConfig } from 'swr'
import { signOut, useSession } from 'next-auth/react'
import { useStore } from '@/app/store'
import axios from 'axios'
import Link from 'next/link'
import {
  CreditCard,
  DollarSign,
  GanttChart,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Menu,
  ScrollText,
  User2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useCurrencies } from '@/hooks/currencies'
import { Currency } from '@/components/currencies/types'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  const setCurrencySign = useStore((state) => state.setCurrencySign)
  const { data: currencies = [] } = useCurrencies()
  const { data: session, status: authStatus, update: updateSession } = useSession()
  const { mutate } = useSWRConfig()

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return
  }

  const { user } = session
  const sessionCurrencySign = currencies.find((item: Currency) => item.code === user.currency)?.sign

  React.useEffect(() => {
    setCurrencySign(sessionCurrencySign)
  }, [sessionCurrencySign])

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
            mutate(key => typeof key === 'string' && key.includes('accounts'), undefined)
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
      name: 'Dashboard',
      icon: <LayoutDashboard />,
      link: '/dashboard/'
    },
    {
      name: 'Accounts',
      icon: <CreditCard />,
      link: '/accounts/'
    },
    {
      name: 'Transactions',
      icon: <ScrollText />,
      link: '/transactions/'
    },
    {
      name: 'Categories',
      icon: <LayoutTemplate />,
      link: '/categories/'
    },
    {
      name: 'Budget',
      icon: <GanttChart />,
      link: '/budget/week'
    },
    {
      name: 'Currencies',
      icon: <DollarSign />,
      link: '/currencies/'
    },
    {
      name: 'Reports',
      icon: <LineChart />,
      link: '/reports/'
    }
  ]

  const bottomMenuItems = [
    {
      name: 'Users',
      icon: <User2 />,
      link: '/users/'
    }
  ]

  const menuComponent = (name: string, icon: ReactElement, link: string): ReactElement => (
    <div onClick={handleDrawerClose} key={name} className="block hover:bg-slate-500 hover:text-white w-full">
      <Link href={link}>
        <div className="flex h-12 justify-start items-center pl-5">
          <div className="pr-5">
            {icon}
          </div>
          <span>{name}</span>
        </div>
      </Link>
    </div>
  )

  return (
    <div className="flex flex-col h-screen">
      <div className={cn(
        "fixed flex flex-col justify-between drop-shadow-sm transition-all ease-in-out delay-50 bg-white overflow-hidden z-40 h-screen",
        open ? 'w-60 shadow-xl' : 'w-16'
      )}>
        <div className="flex flex-col items-start">
          <div className="flex flex-col w-full items-start justify-center pt-16">
            {menuItems.map(({ name, icon, link }) => (
              menuComponent(name, icon, link)
            ))}
          </div>
        </div>
        <div>
          {bottomMenuItems.map(({ name, icon, link }) => (
            <div key={name} className="w-full">
              {menuComponent(name, icon, link)}
            </div>
          ))}
        </div>
      </div>
      <header className="flex w-full z-50 bg-blue-500 text-white">
        <div className="flex mx-2 py-2 pl-20 justify-between w-full items-center">
          <div className="flex items-center gap-2">
            <Menu
              className="text-white absolute left-4 cursor-pointer"
              onClick={open ? handleDrawerClose : handleDrawerOpen}
            />

            <span className="text-2xl font-light uppercase font-sans select-none">I spent a</span>
            <span className="text-2xl font-bold uppercase font-sans select-none">dollar</span>
          </div>
          <div className="flex items-center justify-between">
            {!!currencies?.length && (
              <div className="flex w-80">
                <Select
                  defaultValue={user.currency}
                  onValueChange={handleCurrencyChange}
                >
                  <SelectTrigger className="relative w-full text-black">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="flex bg-white color-black w-full pt-1" position="popper">
                    <SelectGroup>
                      <SelectLabel>Displayed currency</SelectLabel>
                      {currencies && currencies.map((item: Currency) => (
                        <SelectItem key={item.code} value={item.code}>{item.verbalName}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <span className="mx-4">Hello, {user.username}</span>
            <Button
              variant="link"
              className="text-white"
              onClick={async () => await signOut({ callbackUrl: '/login' })}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex flex-col mx-auto pl-20 h-full pt-1 xl">
        {children}
      </div>
    </div >
  )
}

export default Layout
