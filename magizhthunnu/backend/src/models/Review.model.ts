import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images: string[];
  helpfulCount: number;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    images: [{ type: String }],
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
