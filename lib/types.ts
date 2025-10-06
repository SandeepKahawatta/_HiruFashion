export type UserRole = 'user' | 'admin'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ProductDTO {
  id: string
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
  createdAt?: string
  updatedAt?: string
}

export interface AddressDTO {
  fullName: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode?: string
  country: string
  phone?: string
}

export interface OrderItemDTO {
  product: string
  name: string
  price: number
  qty: number
  size?: string
  color?: string
  image?: string
}

export type OrderStatus = 'pending' | 'paid' | 'fulfilled' | 'cancelled'

export interface OrderDTO {
  id: string
  user: string
  items: OrderItemDTO[]
  total: number
  status: OrderStatus
  note?: string
  shippingAddress: AddressDTO
  billingAddress?: AddressDTO
  createdAt: string
  updatedAt: string
}
