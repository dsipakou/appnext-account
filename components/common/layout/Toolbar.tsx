import React from 'react';

interface Types {
  title?: string;
  children: React.ReactNode;
}

const Toolbar: React.FC<Types> = ({ title, children }) => {
  return (
    <div className="my-3 flex w-full items-center justify-between px-6">
      {!!title && <span className="text-xl font-semibold">{title}</span>}
      {children}
    </div>
  );
};

export default Toolbar;
