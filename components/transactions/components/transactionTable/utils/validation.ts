import { RowData } from '..';

export const validateRow = (row: RowData, categoryType: 'INC' | 'EXP'): Set<keyof RowData> => {
  const invalidFields = new Set<keyof RowData>();

  if (!row.date) invalidFields.add('date');
  if (!row.account) invalidFields.add('account');
  if (!row.budget && categoryType === 'EXP') invalidFields.add('budget');
  if (!row.category) invalidFields.add('category');
  if (!row.outcome) invalidFields.add('outcome');
  if (!row.currency) invalidFields.add('currency');

  return invalidFields;
};
