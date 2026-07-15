import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import React from 'react';

import { Input } from '@/components/ui/input';

interface AmountComponentTypes extends GridRenderEditCellParams {}

const AmountComponent: React.FC<AmountComponentTypes> = (params) => {
  const { id, field, value } = params;
  const apiRef = useGridApiContext();
  const inputRef = React.createRef<HTMLInputElement>();

  React.useEffect(() => {
    inputRef.current?.select();
  }, []);

  const handleChange = (event: InputEvent) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value });
  };

  return (
    <div className="flex h-full w-full select-none items-center bg-slate-100">
      <Input
        className="flex h-full rounded-lg border bg-white text-xs"
        value={value}
        ref={inputRef}
        onChange={handleChange}
      />
      <span className="pl-1 text-xs font-semibold xl:pr-2">{params.row.currency?.sign}</span>
    </div>
  );
};

export default AmountComponent;
