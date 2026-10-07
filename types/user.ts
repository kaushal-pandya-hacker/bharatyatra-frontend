export type UserRole = 'TRAVELLER' | 'SUPPLIER_ADMIN' | 'SUPPLIER_STAFF' | 'PLATFORM_ADMIN' | 'SUPPORT_AGENT';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface User {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  accountStatus: AccountStatus;
  preferredLanguage: 'en' | 'gu' | 'hi';
  timezone: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
}

export interface Traveller {
  travellerId: string;
  userId: string;
  fullName: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  idProofType?: 'AADHAAR' | 'PASSPORT' | 'PAN' | 'DRIVING_LICENSE';
  relationship: string;
}
