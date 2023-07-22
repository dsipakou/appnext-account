import { useEffect, useContext } from 'react'
import { signOut } from 'next-auth/react'
// import { AuthContext } from '@/context/auth'

const Logout = () => {
  // const { logout } = useContext(AuthContext)
  useEffect(() => {
    // logout();
    signOut({
      callbackUrl: '/login'
    })
  }, []);
};

export default Logout
