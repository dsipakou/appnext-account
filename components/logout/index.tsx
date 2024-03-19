'use client'

import React from 'react'
import { signOut } from 'next-auth/react'

const Index = () => {
  React.useEffect(() => {
    signOut({
      callbackUrl: '/login'
    })
  }, [])
}

export default Index
