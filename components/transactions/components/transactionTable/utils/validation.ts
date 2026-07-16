import { RowData } from '..';

export const validateRow = (row: RowData, categoryType: 'INC' | 'EXP'): Set<keyof RowData> => {
  const invalidFields = new Set<keyof RowData>();
  console.log(row);

  if (!row.date) invalidFields.add('date');
  if (!row.account) invalidFields.add('account');
  if (!row.budget && categoryType === 'EXP') invalidFields.add('budget');
  if (!row.category || !row.categoryName) invalidFields.add('category');
  if (!row.outcome) invalidFields.add('outcome');

  return invalidFields;
};
