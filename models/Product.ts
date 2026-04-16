import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  color: string;
  stock: number;
  price: number;
  image: string; // base64 or URL
  barcode: string;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  color: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  barcode: { type: String, unique: true, sparse: true },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
}, { timestamps: true });

ProductSchema.index({ name: 'text', category: 'text', color: 'text' });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
