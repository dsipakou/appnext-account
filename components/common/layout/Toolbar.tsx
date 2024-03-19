import React from 'react'

interface Types {
  title?: string
  children: React.ReactNode
}

const Toolbar: React.FC<Types> = ({ title, children }) => {
  return (
    <div className="flex w-full px-6 my-3 justify-between items-center">
      {!!title && <span className="text-xl font-semibold">{title}</span>}
      {children}
    </div>
  )
}

export default Toolbar
