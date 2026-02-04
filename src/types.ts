
export enum UserRole {
  ADMIN = 'ADMIN',
  COMPANY = 'COMPANY',
  GUEST = 'GUEST'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  balance: number;
  status: 'active' | 'pending' | 'suspended';
}

export interface Transaction {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  type: 'credit' | 'debit';
  recipientsCount: number;
  status: 'completed' | 'failed' | 'processing';
  timestamp: string;
}

export interface Recipient {
  name: string;
  phoneNumber: string;
  amount: number;
  status?: 'success' | 'failed' | 'pending';
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  expiryDate: string;
  isActive: boolean;
}
