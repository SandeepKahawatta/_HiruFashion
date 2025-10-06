import { Schema, model, models, Document, Types } from 'mongoose'

export interface OrderItem {
  product: Types.ObjectId
  name: string
  price: number
  qty: number
  size?: string
  color?: string
  image?: string
}

export interface Address {
  fullName: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  phone?: string
}

export interface OrderDoc extends Document {
  user: Types.ObjectId
  items: OrderItem[]
  total: number
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled'
  note?: string
  shippingAddress: Address
  billingAddress?: Address
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, required: true },
    phone: { type: String }
  },
  { _id: false }
)

const OrderItemSchema = new Schema<OrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    size: { type: String },
    color: { type: String },
    image: { type: String }
  },
  { _id: false }
)

const OrderSchema = new Schema<OrderDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'fulfilled', 'cancelled'], default: 'pending' },
    note: { type: String },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema }
  },
  { timestamps: true }
)

OrderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    ret.user = ret.user?.toString()
    ret.items = Array.isArray(ret.items)
      ? ret.items.map((item: OrderItem & { product: Types.ObjectId | string }) => {
          const productId =
            typeof item.product === 'string'
              ? item.product
              : item.product instanceof Types.ObjectId
                ? item.product.toString()
                : item.product?.toString?.() ?? ''
          return { ...item, product: productId }
        })
      : []
    delete ret._id
    delete ret.__v
    return ret
  }
})

const Order = models.Order || model<OrderDoc>('Order', OrderSchema)

export default Order
