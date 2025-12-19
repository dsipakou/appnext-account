import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import DateComponent from '@/components/transactions/forms/components/DateComponentV2';
import { RowData } from '..';

interface DateCellProps {
  isEditing: boolean;
  value: Date;
  cellStyle: string;
  // Edit mode props
  handleChange?: (id: number, field: keyof RowData, value: any) => void;
  row?: RowData;
  isInvalid?: boolean;
  user?: string | null;
}

export const DateCell: React.FC<DateCellProps> = ({
  isEditing,
  value,
  cellStyle,
  handleChange,
  row,
  isInvalid,
  user,
}) => {
  if (isEditing && row && handleChange) {
    return <DateComponent user={user} value={value} handleChange={handleChange} row={row} isInvalid={isInvalid} />;
  }

  return (
    <div className="px-1 flex items-center justify-center">
      <Badge variant="outline" className={`text-xs font-medium ${cellStyle}`}>
        {format(value, 'dd MMM yyyy')}
      </Badge>
    </div>
  );
};
