import { useEffect } from 'react';
import { useAuth } from '@/context/auth';

const Logout = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, []);
};

export default Logout;
