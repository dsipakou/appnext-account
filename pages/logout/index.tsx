import { useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth';

const Logout = () => {
  const { logout } = useContext(AuthContext)
  useEffect(() => {
    logout();
  }, []);
};

export default Logout;
