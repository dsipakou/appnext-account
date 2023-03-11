import { useEffect, useContent } from 'react';
import { AuthContext } from '@/context/auth';

const Logout = () => {
  const auth = useContent(AuthContext)
  const { logout } = auth
  useEffect(() => {
    logout();
  }, []);
};

export default Logout;
