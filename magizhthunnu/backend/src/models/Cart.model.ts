import mongoose, { Document, Schema } from 'mongoose';

interface ICartItemCustomization {
  name: string;
  option: string;
  extraPrice: number;
}

export interface ICartItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  customizations: ICartItemCustomization[];
  subtotal: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    customizations: [
      {
        name: String,
        option: String,
        extraPrice: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// TTL index — auto-delete abandoned carts after 24 hours
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
