
export interface User {
  id: string; // The 9-digit unique ID
  email: string;
  name: string;
  dob: {
    day: string;
    month: string;
    year: string;
  };
  profilePic?: string;
  balance: number;
  registered: boolean;
}

export type TransactionType = 'send' | 'receive';

export interface Transaction {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  timestamp: number;
  type: TransactionType;
  partnerName: string;
  partnerPhoto?: string;
  partnerId: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}
