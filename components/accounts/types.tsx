export type Account = {
  uuid: string;
  title: string;
  kind: string;
  category: string | null;
  user: string;
  isDefault: boolean;
  description: string;
};

export type AccountResponse = {
  createdAt: string;
  modifiedAt: string;
} & Account;

type Usage = {
  month: string;
  spendings: number;
  income: number;
};

export type AccountDetails = {
  usage: Usage[];
} & AccountResponse;
