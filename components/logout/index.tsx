'use client';

import { signOut } from 'next-auth/react';
import React from 'react';

const Index = () => {
  React.useEffect(() => {
    signOut({
      callbackUrl: '/login',
    });
  }, []);
};

export default Index;
