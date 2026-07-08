import mongoose, { Document, Schema } from 'mongoose';

interface ICustomizationOption {
  label: string;
  extraPrice: number;
}

interface ICustomization {
  name: string;
  options: ICustomizationOption[];
}

export interface IMenuItem extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  tags: string[];
  customizations: ICustomization[];
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    image: { type: String },
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String }],
    customizations: [
      {
        name: { type: String, required: true },
        options: [{ label: { type: String }, extraPrice: { type: Number, default: 0 } }],
      },
    ],
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, isAvailable: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);
