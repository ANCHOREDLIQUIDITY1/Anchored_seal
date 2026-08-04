export interface IParty {
  _id?: string;
  userId?: string;
  name: string;
  email: string;
  role: 'creator' | 'signer' | 'witness' | 'viewer';
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'signed';
  token: string;
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  rejectNote?: string;
}

export interface IAuditTrail {
  _id?: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
}

export interface IAgreement {
  _id: string;
  title: string;
  shortId: string;
  description?: string;
  value?: string;
  category: 'Business Partnership' | 'Freelance Contract' | 'Loan Agreement' | 'NDA' | 'Personal Agreement' | 'Custom Agreement';
  status: 'draft' | 'pending' | 'partially_signed' | 'signed' | 'rejected' | 'expired' | 'cancelled';
  creator: string | { _id: string; name: string; email: string };
  parties: IParty[];
  clauses: { order: number; title?: string; content: string }[];
  comments: { user: string; text: string; createdAt: string }[];
  auditTrail: IAuditTrail[];
  isLocked: boolean;
  expiresAt?: string;
  pdfHash?: string;
  isDeleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  plan?: string;
  role?: string;
  createdAt?: string;
  preferences?: {
    darkMode?: boolean;
    language?: string;
    timezone?: string;
    notifications?: Record<string, boolean>;
  };
}

export interface CreateAgreementPayload {
  title: string;
  category: string;
  description?: string;
  value?: string;
  expiresAt?: string;
  parties: { name: string; email: string; role: string }[];
  clauses: { order: number; content: string }[];
}

