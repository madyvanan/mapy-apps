import mongoose, { Document, Schema } from 'mongoose';
import { PaymentStatus, PaymentGateway } from '../types';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: 'INR';
  gateway: PaymentGateway;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  checksum?: string;
  status: PaymentStatus;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    gateway: { type: String, enum: ['paytm'], default: 'paytm' },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    checksum: { type: String },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    idempotencyKey: { type: String, required: true, unique: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

paymentSchema.index({ gatewayPaymentId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
