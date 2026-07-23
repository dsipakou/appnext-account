'use client';

import axios from 'axios';
import {
  CreditCard,
  DollarSign,
  GanttChart,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  Menu,
  ScrollText,
  User2,
} from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import React, { FC, ReactElement, ReactNode } from 'react';
import { useSWRConfig } from 'swr';

import { useStore } from '@/app/store';
import { Currency } from '@/components/currencies/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrencies } from '@/hooks/currencies';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const setCurrency = useStore((state) => state.setCurrency);
  const { data: currencies = [] } = useCurrencies();
  const { data: session, status: authStatus, update: updateSession } = useSession();
  const { mutate } = useSWRConfig();

  if (authStatus === 'loading' || authStatus === 'unauthenticated') {
    return;
  }

  const user = session?.user;
  if (!user) {
    return;
  }
  const sessionCurrency = currencies.find((item: Currency) => item.code === user.currency);

  React.useEffect(() => {
    if (!sessionCurrency) {
      return;
    }
    setCurrency({
      sign: sessionCurrency.sign,
      code: sessionCurrency.code,
    });
  }, [sessionCurrency]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleCurrencyChange = (currencyCode: string) => {
    if (currencyCode !== user.currency) {
      axios
        .patch('users/currency/', {
          currency: currencyCode,
        })
        .then((res) => {
          if (res.status === 200) {
            // TODO: Remove this after migrating to session
            // updateCurrency(currencyCode)
            updateSession({ currency: currencyCode });
            mutate((key) => typeof key === 'string' && key.includes('accounts'), undefined);
            // TODO: mutate something
          }
        })
        .catch((error) => {
          const errRes = error.response.data;
        });
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard />,
      link: '/dashboard/',
    },
    {
      name: 'Accounts',
      icon: <CreditCard />,
      link: '/accounts/',
    },
    {
      name: 'Transactions',
      icon: <ScrollText />,
      link: '/transactions/',
    },
    {
      name: 'Categories',
      icon: <LayoutTemplate />,
      link: '/categories/',
    },
    {
      name: 'Budget',
      icon: <GanttChart />,
      link: '/budget/week',
    },
    {
      name: 'Currencies',
      icon: <DollarSign />,
      link: '/currencies/',
    },
    {
      name: 'Reports',
      icon: <LineChart />,
      link: '/reports/',
    },
  ];

  const bottomMenuItems = [
    {
      name: 'Users',
      icon: <User2 />,
      link: '/users/',
    },
  ];

  const menuComponent = (name: string, icon: ReactElement, link: string): ReactElement => (
    <div onClick={handleDrawerClose} key={name} className="block w-full hover:bg-slate-500 hover:text-white">
      <Link href={link}>
        <div className="flex h-12 items-center justify-start pl-5">
          <div className="pr-5">{icon}</div>
          <span>{name}</span>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-secondary">
      <div
        className={cn(
          'delay-50 fixed z-40 flex h-screen flex-col justify-between overflow-hidden bg-white drop-shadow-sm transition-all ease-in-out',
          open ? 'w-60 shadow-xl' : 'w-16',
        )}
      >
        <div className="flex flex-col items-start">
          <div className="flex w-full flex-col items-start justify-center pt-16">
            {menuItems.map(({ name, icon, link }) => menuComponent(name, icon, link))}
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
      <header className="z-50 flex w-full bg-blue-500 text-white">
        <div className="mx-2 flex w-full items-center justify-between py-2 pl-20">
          <div className="flex items-center gap-2">
            <Menu
              className="absolute left-4 cursor-pointer text-white"
              onClick={open ? handleDrawerClose : handleDrawerOpen}
            />

            <span className="select-none font-sans text-2xl font-light uppercase">I spent a</span>
            <span className="select-none font-sans text-2xl font-bold uppercase">dollar</span>
          </div>
          <div className="flex items-center justify-between">
            {!!currencies?.length && (
              <div className="flex w-80">
                <Select defaultValue={user.currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="relative w-full text-black">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="color-black flex w-full bg-white pt-1" position="popper">
                    <SelectGroup>
                      <SelectLabel>Displayed currency</SelectLabel>
                      {currencies &&
                        currencies.map((item: Currency) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.verbalName}
                          </SelectItem>
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
      <div className="container mx-auto flex min-h-0 flex-1 flex-col overflow-hidden pl-20">{children}</div>
    </div>
  );
};

export default Layout;
