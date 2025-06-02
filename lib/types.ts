export interface User {
  id: number;
  login: string;
  email?: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  createdAt: string;
  path: string;
  object: {
    name: string;
    type: string;
  };
}

export interface Progress {
  id: number;
  grade: number;
  createdAt: string;
  updatedAt: string;
  path: string;
  object: {
    name: string;
    type: string;
  };
}

export interface Result {
  id: number;
  grade: number;
  type: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  object: {
    name: string;
    type: string;
  };
}

export interface ProfileData {
  user: User;
  xpTransactions: Transaction[];
  progress: Progress[];
  results: Result[];
}