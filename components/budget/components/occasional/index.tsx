import React from 'react';
import Toolbar from '@/components/common/layout/Toolbar';

const Index: React.FC = () => {
  return (
    <div className="flex flex-col h-full max-h-full">
      <Toolbar title={'Recurrent Budgets'}>
        {/* Add any toolbar actions here */}
      </Toolbar>
      <div className="flex w-full mt-5 h-full max-h-full">
        <div className="w-full">
          {/* Recurrent budget management content will go here */}
          <div className="flex w-full h-full pt-20 justify-center items-center">
            <span className="text-2xl">Recurrent Budget Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;