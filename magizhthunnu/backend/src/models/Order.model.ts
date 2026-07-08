import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus, PaymentStatus } from '../types';

interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  customizations: { name: string; option: string; extraPrice: number }[];
  subtotal: number;
}

interface IDeliveryAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryAddress: IDeliveryAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: mongoose.Types.ObjectId;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  totalAmount: number;
  estimatedDelivery?: Date;
  deliveryAgent?: string;
  idempotencyKey: string;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [
      {
        menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        customizations: [{ name: String, option: String, extraPrice: Number }],
        subtotal: { type: Number, required: true },
      },
    ],
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: { lat: { type: Number, default: 0 }, lng: { type: Number, default: 0 } },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    estimatedDelivery: { type: Date },
    deliveryAgent: { type: String },
    idempotencyKey: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
