import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISignature extends Document {
  user: Types.ObjectId;
  type: 'drawn' | 'typed' | 'uploaded';
  imageData?: string;
  typedText?: string;
  fontStyle?: string;
  isDefault: boolean;
  hash?: string;
  ipAddress?: string;
}

const signatureSchema = new Schema<ISignature>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['drawn', 'typed', 'uploaded'], required: true },
    imageData: { type: String },
    typedText: { type: String },
    fontStyle: { type: String },
    isDefault: { type: Boolean, default: false },
    hash: { type: String },
    ipAddress: { type: String }
  },
  { timestamps: true }
);

// Enforce only one default signature per user
signatureSchema.pre('save', async function (next: any) {
  if (this.isModified('isDefault') && this.isDefault) {
    await mongoose.model('Signature').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export const Signature = mongoose.model<ISignature>('Signature', signatureSchema);
