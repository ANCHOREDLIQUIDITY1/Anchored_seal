import mongoose, { Document, Schema, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IParty {
  userId?: Types.ObjectId;
  name: string;
  email: string;
  role: 'creator' | 'signer' | 'witness' | 'viewer';
  status: 'pending' | 'viewed' | 'accepted' | 'rejected' | 'signed';
  token: string;
  signedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  rejectNote?: string;
}

export interface IAgreement extends Document {
  title: string;
  shortId: string;
  category: 'Business Partnership' | 'Freelance Contract' | 'Loan Agreement' | 'NDA' | 'Personal Agreement' | 'Custom Agreement';
  status: 'draft' | 'pending' | 'partially_signed' | 'signed' | 'rejected' | 'expired' | 'cancelled';
  creator: Types.ObjectId;
  parties: IParty[];
  clauses: { order: number; title?: string; content: string }[];
  comments: { user: Types.ObjectId; text: string; createdAt: Date }[];
  auditTrail: { action: string; actor: string; timestamp: Date; details?: string }[];
  isLocked: boolean;
  expiresAt?: Date;
  pdfHash?: string;
  isDeleted: boolean;
  completedAt?: Date;
}

const partySchema = new Schema<IParty>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['creator', 'signer', 'witness', 'viewer'], required: true },
  status: { type: String, enum: ['pending', 'viewed', 'accepted', 'rejected', 'signed'], required: true, default: 'pending' },
  token: { type: String, required: true, default: () => randomUUID() },
  signedAt: { type: Date },
  ipAddress: { type: String },
  userAgent: { type: String },
  rejectNote: { type: String }
});

const agreementSchema = new Schema<IAgreement>(
  {
    title: { type: String, required: true, maxlength: 200 },
    shortId: { type: String, required: true, unique: true },
    category: { 
      type: String, 
      enum: ['Business Partnership', 'Freelance Contract', 'Loan Agreement', 'NDA', 'Personal Agreement', 'Custom Agreement'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['draft', 'pending', 'partially_signed', 'signed', 'rejected', 'expired', 'cancelled'], 
      required: true, 
      default: 'draft' 
    },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    parties: { type: [partySchema], required: true },
    clauses: [{ order: Number, title: String, content: String }],
    comments: [{ user: { type: Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
    auditTrail: [{ action: String, actor: String, timestamp: { type: Date, default: Date.now }, details: String }],
    isLocked: { type: Boolean, default: false },
    expiresAt: { type: Date },
    pdfHash: { type: String },
    isDeleted: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

// State Machine logic
agreementSchema.pre('save', function (next: any) {
  if (this.isModified('parties') && this.status !== 'cancelled' && this.status !== 'expired') {
    // If sent (not draft)
    if (this.status !== 'draft') {
      const allSigners = this.parties.filter(p => p.role === 'signer' || p.role === 'creator');
      const hasRejected = this.parties.some(p => p.status === 'rejected');
      const signedCount = allSigners.filter(p => p.status === 'signed').length;
      
      if (hasRejected) {
        this.status = 'rejected';
      } else if (signedCount === allSigners.length && allSigners.length > 0) {
        this.status = 'signed';
        if (!this.completedAt) this.completedAt = new Date();
      } else if (signedCount > 0) {
        this.status = 'partially_signed';
      }
    }
  }
  
  if (this.expiresAt && new Date() > this.expiresAt) {
    this.status = 'expired';
  }
  
  next();
});

export const Agreement = mongoose.model<IAgreement>('Agreement', agreementSchema);
