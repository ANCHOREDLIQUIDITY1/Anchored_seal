import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  phone?: string;
  plan: 'free' | 'pro' | 'business';
  role: 'user' | 'admin' | 'superadmin';
  preferences: {
    darkMode?: boolean;
    language?: string;
    timezone?: string;
    notifications?: Record<string, boolean>;
  };
  isEmailVerified: boolean;
  isBanned: boolean;
  lastLogin?: Date;
  passwordResetToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, select: false }, 
    googleId: { type: String, select: false },
    avatar: { type: String },
    phone: { type: String, trim: true },
    plan: { type: String, enum: ['free', 'pro', 'business'], required: true, default: 'free' },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], required: true, default: 'user' },
    preferences: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      timezone: { type: String },
      notifications: { type: Map, of: Boolean }
    },
    isEmailVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    lastLogin: { type: Date },
    passwordResetToken: { type: String, select: false }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
