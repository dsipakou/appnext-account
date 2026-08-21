export interface Account {
  uuid: string;
  title: string;
  kind: string;
  category: string | null;
  user: string;
  isDefault: boolean;
  description: string;
}

export interface AccountResponse extends Account {
  createdAt: string;
  modifiedAt: string;
}
