import { Schema, model, models, Document } from 'mongoose'

export interface ProductDoc extends Document {
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  inventory: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<ProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true, lowercase: true },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    inventory: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
)

ProductSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

const Product = models.Product || model<ProductDoc>('Product', ProductSchema)

export default Product
