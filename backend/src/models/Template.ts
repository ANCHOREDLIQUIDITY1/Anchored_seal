import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITemplate extends Document {
  name: string;
  category: string;
  isPublic: boolean;
  isPremium: boolean;
  useCount: number;
  clauses: { order: number; title?: string; content: string }[];
  variables: { key: string; label: string; type: string; required: boolean }[];
  createdBy?: Types.ObjectId | null;
}

const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    category: { 
      type: String, 
      enum: ['Business Partnership', 'Freelance Contract', 'Loan Agreement', 'NDA', 'Personal Agreement', 'Custom Agreement'],
      required: true 
    },
    isPublic: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    useCount: { type: Number, default: 0 },
    clauses: [{ order: Number, title: String, content: String }],
    variables: [{ key: String, label: String, type: String, required: Boolean }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

export const Template = mongoose.model<ITemplate>('Template', templateSchema);
