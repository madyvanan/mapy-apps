import mongoose, { Document, Schema } from 'mongoose';

interface IOpeningHour {
  open: string;
  close: string;
}

export interface IRestaurant extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  cuisineTypes: string[];
  logo?: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: { type: 'Point'; coordinates: [number, number] };
  };
  rating: number;
  totalRatings: number;
  isOpen: boolean;
  openingHours: Record<string, IOpeningHour>;
  deliveryRadius: number;
  minOrder: number;
  deliveryFee: number;
  avgDeliveryTime: number;
  isVerified: boolean;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    cuisineTypes: [{ type: String }],
    logo: { type: String },
    coverImage: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isOpen: { type: Boolean, default: false },
    openingHours: { type: Map, of: { open: String, close: String }, default: {} },
    deliveryRadius: { type: Number, default: 5 },
    minOrder: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 30 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

restaurantSchema.index({ 'address.location': '2dsphere' });
restaurantSchema.index({ cuisineTypes: 1, isOpen: 1 });
restaurantSchema.index({ name: 'text', description: 'text' });
restaurantSchema.index({ ownerId: 1 });

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', restaurantSchema);
