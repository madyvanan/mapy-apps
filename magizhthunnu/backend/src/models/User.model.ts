import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAddress {
  _id: mongoose.Types.ObjectId;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'restaurant' | 'admin';
  phone?: string;
  avatar?: string;
  addresses: IAddress[];
  isActive: boolean;
  // snake_case here intentionally matches the verification spec's model field names
  mail_verify_link_sent: boolean;
  mail_verified: boolean;
  mobile_verified: boolean;
  mobileOtpHash?: string;
  mobileOtpExpiresAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const addressSchema = new Schema<IAddress>(
  {
    label: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'restaurant', 'admin'], default: 'customer' },
    phone: { type: String },
    avatar: { type: String },
    addresses: [addressSchema],
    isActive: { type: Boolean, default: true },
    mail_verify_link_sent: { type: Boolean, default: false },
    mail_verified: { type: Boolean, default: false },
    mobile_verified: { type: Boolean, default: false },
    mobileOtpHash: { type: String, select: false },
    mobileOtpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash as string);
};

userSchema.index({ role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
