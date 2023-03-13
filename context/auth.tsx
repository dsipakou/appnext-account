import React, { createContext, useState, useContext, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import axios from 'axios';
import { database, userTable, addUser } from '@/models/indexedDb.config';
import { LoginResponse } from '@/components/login/types';

type ActiveUser = UserState | null;

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

const defaultValues: Auth = {
  isAuthenticated: false,
  user: null,
  login: () => undefined,
  logout: () => undefined,
  loading: () => false,
}

export const AuthContext = createContext<Auth>(defaultValues);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<ActiveUser>(null);
  const [loading, setLoading] = useState<boolean>(true);
  //const users = useLiveQuery(() => database.users.toArray())
  let db

  useEffect(() => {
    const loadUserFromIndexedDB = async (): Promise<void> => {
      //const userList: Array<UserState> = await userTable.toArray();
      //const user = userList[0];
      let user = null
      const openRequest = window.indexedDB.open("accountdb", 10)
      openRequest.onsuccess = (event) => {
        db = openRequest.result;
        const transaction = db.transaction("user")
        const objectStore = transaction.objectStore("user")
        console.log(objectStore)
        const objectStoreRequest = objectStore.get(0)
        objectStoreRequest.onsuccess = (event) => {
          user = objectStoreRequest.result
          console.log(user.token)
          axios.defaults.headers.common['Authorization'] = `Token ${user.token}`;
          setUser(user);
        }
      }
      setLoading(false)
    }
    loadUserFromIndexedDB()
  }, [])

  const storeUserData = (userData: LoginResponse): void => {
    console.log('set user')
    //await userTable.put(userData);
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
          addUser(userData)
          //storeUserData(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
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
    //await userTable.clear();
    setUser(null);
    delete axios.defaults.headers.Authorization;
    setLoading(false);
    window.location.pathname = '/login'
  }

  const updateCurrency = async (newCurrency: string): Promise<void> => {
    setLoading(true)
    // const user = await userTable.get(0)
    // await userTable.update(0, { currency: newCurrency })
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
