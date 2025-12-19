import { RowData } from '.';

export interface BaseCellProps {
  row: RowData;
  cellStyle: string;
}

export interface BaseEditCellProps extends BaseCellProps {
  handleChange: (id: number, field: keyof RowData, value: any) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>, id: number) => void;
  isInvalid: boolean;
  user: string | null;
}
