import React, { createContext, useState, useContext, useEffect } from 'react';
import Router from 'next/router';
import axios from 'axios';
import {
  clear,
  get,
  set,
} from '@/models/indexedDb.config';

type ActiveUser = UserState | null;

interface UserState {
  email: string,
  username: string,
  currency: string,
  token: string,
}

interface Auth {
  isAuthenticated: boolean
  user: ActiveUser
  login: (email: string, password: string) => Promise<void> | undefined
  logout: () => void
  loading: boolean
}

const defaultValues: Auth = {
  isAuthenticated: false,
  user: null,
  login: () => undefined,
  logout: () => undefined,
  loading: false,
}

export const AuthContext = createContext<Auth>(defaultValues);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<ActiveUser>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserFromIndexedDB = async (): Promise<void> => {
      setLoading(true)
      const user = await get(0)

      if (user) {
        axios.defaults.headers.common['Authorization'] = `Token ${user.token}`;
        setUser(user);
      }
      setLoading(false)
    }
    loadUserFromIndexedDB()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true)
    let response = null

    try {
      response = await axios.post('users/login/', {
        email,
        password
      })
    } catch (error) {
      // TODO: handle axios error
      return
    }

    if (response.status === 200) {
      const data = response.data
      const userData: UserState = {
        username: data.username,
        email: data.email,
        currency: data.currency,
        token: data.token,
      };
      await set(0, userData)
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      window.location.pathname = '/';
    } else {
      // TODO: handle non 200 statuses
    }

    setLoading(false)
  }

  const logout = async (): Promise<void> => {
    setLoading(true);
    await clear()
    setUser(null);
    delete axios.defaults.headers.Authorization;
    setLoading(false);
    window.location.pathname = '/login'
  }

  const updateCurrency = async (newCurrency: string): Promise<void> => {
    setLoading(true)
    const user = await get(0)
    await set(0, { ...user, currency: newCurrency })
    setLoading(false)
    Router.reload(window.location.pathname)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        loading,
        logout,
        updateCurrency
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
