export interface User {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  createdAt: string; // Changed from dateJoined to match the GraphQL query
  email?: string; // Made optional since it might not always be present
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

export interface AuditsMade {
  amount: number;
  createdAt: string;
}

export interface AuditsGot {
  amount: number;
  createdAt: string;
}