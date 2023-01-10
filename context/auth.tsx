import React, { createContext, useState, useContext, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import axios from 'axios';
import { userTable } from '@/models/indexedDb.config';
import { LoginResponse } from '@/components/login/types';

interface UserState {
  id: number,
  email: string,
  username: string,
  currency: string,
  token: string,
}

interface Auth {
  isAuthenticated: boolean
  user: ActiveUser
  login: () => void
  logout: () => void
  loading: boolean
}

type ActiveUser = UserState | null;

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<ActiveUser>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUserFromIndexedDB = async (): Promise<void> => {
      const userList: Array<UserState> = await userTable.toArray();
      const user = userList[0];
      if (user) {
        axios.defaults.headers.Authorization = `Token ${user.token}`;
        setUser(user);
      }
      setLoading(false)
    }
    loadUserFromIndexedDB()
  }, [])

  const storeUserData = async (userData: LoginResponse): Promise<void> => {
    await userTable.put(userData);
  }

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    axios
      .post('users/login/', {
        email,
        password,
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data;
          const userData: UserState = {
            id: 0,
            username: data.username,
            email: data.email,
            currency: data.currency,
            token: data.token,
          };
          storeUserData(userData);
          axios.defaults.headers.Authorization = `Bearer ${userData.token}`;
          window.location.pathname = '/';
        } else {
          // TODO: handle error
        }
      })
      .catch((error) => {
        // TODO: handle error
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const logout = async (): Promise<void> => {
    setLoading(true); 
    await userTable.clear();
    setUser(null);
    delete axios.defaults.headers.Authorization;
    setLoading(false);
    window.location.pathname = '/login'
  }

  const updateCurrency = async (newCurrency: string): Promise<void> => {
    setLoading(true)
    const user = await userTable.get(0)
    await userTable.update(0, { currency: newCurrency })
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
