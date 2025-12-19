export const getCellClassName = (isInvalid: boolean): string => {
  return `px-1 py-1 ${isInvalid ? 'border-2 border-red-500' : ''}`;
};

export const getCommonInputClass = (inputStyle: string): string => {
  return `w-full h-8 px-2 text-sm border-0 focus:ring-2 focus:border-primary ${inputStyle}`;
};

export const getInputStyle = (isInvalid: boolean): string => {
  return `w-full h-8 px-2 text-sm border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white ${
    isInvalid ? 'ring-2 ring-red-400' : ''
  }`;
};
