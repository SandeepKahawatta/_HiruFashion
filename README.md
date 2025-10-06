# HiruFashion — Next.js 14 + MongoDB + Cloudinary

Full-stack e-commerce app built with **Next.js 14 (App Router, TS)**, **MongoDB/Mongoose**, **TailwindCSS**, **Cloudinary (signed uploads)**, **JWT cookie auth (user/admin)**, and a **localStorage-persisted Cart**.
Mobile-first UI. Admin can manage products & orders. Users can browse, add to cart, checkout, and view orders.

## Tech Stack

* Next.js 14 (App Router) + TypeScript, ESLint, SWC
* TailwindCSS + PostCSS + autoprefixer
* MongoDB (Mongoose)
* Cloudinary (signed client uploads)
* JWT cookies for auth, `middleware.ts` for route protection
* REST APIs in `app/api/*`
* React Context for cart (persisted to localStorage)
* Deployed on Vercel (free tier OK)

---

## Project Structure

```
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (shop)/
    page.tsx                      # Home: category cards + 6 featured (WelcomeGate on first login)
    products/page.tsx             # All products grid
    products/[slug]/page.tsx      # Product details with gallery
    cart/page.tsx                 # Cart
    checkout/page.tsx             # Checkout (shipping/billing/note, select size/color/qty)
    success/page.tsx              # Order success message
    category/[slug]/page.tsx      # Products by category
    orders/page.tsx               # User order list (protected)
    orders/[id]/page.tsx          # User order details (protected)
  admin/
    layout.tsx                    # Admin guard
    products/page.tsx             # CRUD with multi-image upload (Cloudinary signed)
    orders/page.tsx               # Admin order list
    orders/[id]/page.tsx          # Admin order edit
  api/
    auth/login/route.ts           # POST login
    auth/register/route.ts        # POST register
    auth/logout/route.ts          # POST logout
    cloudinary-sign/route.ts      # GET signed upload params
    dev/seed-admin/route.ts       # POST one-time seed admin (guarded by env)
    products/route.ts             # GET all, POST create (admin)
    products/[idOrSlug]/route.ts  # GET one, PUT, DELETE (admin for mutating)
    orders/route.ts               # POST create (user), GET all (admin)
    orders/[id]/route.ts          # GET one (owner/admin), PUT update (admin)
  layout.tsx
  page.tsx                        # (Optional) redirect to / for Home in (shop)
  globals.css
components/
  Navbar.tsx
  ProductCard.tsx
  ProductPageClient.tsx
  CategoryCard.tsx
  WelcomeGate.tsx
  Form/Input.tsx etc.             # (optional helpers)
lib/
  db.ts                           # Mongoose connection
  auth.ts                         # JWT cookie helpers, guards
  models/
    User.ts
    Product.ts
    Order.ts
  cart/
    context.tsx                   # cart storage {id, qty, size?}
    hooks.ts                      # useCart, useCartDetails (hydrate from API)
  api.ts                          # apiFetch helper (client safe)
  utils.ts                        # slugify, cn, etc.
public/
  placeholder.png
tailwind.config.ts
postcss.config.js
next.config.js
.env.example
middleware.ts
```

---

## Environment Variables (`.env.local`)

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/hirufashion?retryWrites=true&w=majority

# JWT
JWT_SECRET=replace-with-long-random-string

# Cloudinary (server)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=111111111111111
CLOUDINARY_API_SECRET=your_secret

# Cloudinary (client-safe)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=111111111111111
NEXT_PUBLIC_UPLOAD_PRESET=secure_products   # signed preset name

# Admin seed (optional)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
ALLOW_ADMIN_SEED=true
```

> In Cloudinary, create an **Upload Preset** set to **Signed** (name it `secure_products`).
> In MongoDB Atlas, create a database user and allow network access.

---

## Scripts

```bash
npm i
npm run dev        # http://localhost:3000
npm run build
npm start
```

---

## next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ]
  }
};
module.exports = nextConfig;
```

---

## Tailwind

`tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
export default config
```

`globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Mongoose Connection (`lib/db.ts`)

```ts
import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI!
if (!MONGODB_URI) throw new Error('Missing MONGODB_URI')

let cached = (global as any).mongoose || { conn: null, promise: null }

export async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: 'hirufashion' }).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

---

## Models

`lib/models/User.ts`

```ts
import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true })

export default models.User || model('User', UserSchema)
```

`lib/models/Product.ts`

```ts
import { Schema, model, models } from 'mongoose'

const ProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: String,
  description: String,
  price: { type: Number, required: true }, // cents
  images: { type: [String], default: [] },
  image: { type: String },                 // cover (first from images)
}, { timestamps: true })

export default models.Product || model('Product', ProductSchema)
```

`lib/models/Order.ts`

```ts
import { Schema, model, models, Types } from 'mongoose'

const OrderSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    qty: Number,
    size: String,
    color: String,
  }],
  subtotal: Number,
  shippingAddress: String,
  billingAddress: String,
  note: String,
  status: { type: String, enum: ['pending','paid','shipped','cancelled'], default: 'pending' }
}, { timestamps: true })

export default models.Order || model('Order', OrderSchema)
```

---

## Auth Helpers (`lib/auth.ts`)

```ts
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export type Session = { userId: string; email: string; role: 'user'|'admin' }

export function createJWT(payload: Session) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function getSessionFromCookies(): Session | null {
  try {
    const token = cookies().get('session')?.value
    if (!token) return null
    return jwt.verify(token, JWT_SECRET) as Session
  } catch {
    return null
  }
}

export function requireUser(role?: 'admin') {
  const s = getSessionFromCookies()
  if (!s) throw new Error('AUTH_REQUIRED')
  if (role === 'admin' && s.role !== 'admin') throw new Error('FORBIDDEN')
  return s
}
```

---

## API Helper (`lib/api.ts`)

```ts
'use client'
const base = process.env.NEXT_PUBLIC_BASE_URL || ''
export async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(`${base}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  return res
}
```

---

## Cloudinary Signed Upload

`app/api/cloudinary-sign/route.ts`

```ts
import { v2 as cloudinary } from 'cloudinary'
import { NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function GET() {
  const timestamp = Math.round(Date.now() / 1000)
  const upload_preset = process.env.NEXT_PUBLIC_UPLOAD_PRESET!
  const signature = cloudinary.utils.api_sign_request({ timestamp, upload_preset }, process.env.CLOUDINARY_API_SECRET!)
  return NextResponse.json({
    timestamp,
    signature,
    uploadPreset: upload_preset,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  })
}
```

Client uploader (`lib/client/uploadImage.ts`):

```ts
'use client'
export async function uploadImage(file: File) {
  const sigRes = await fetch('/api/cloudinary-sign')
  const { timestamp, signature, apiKey, cloudName, uploadPreset } = await sigRes.json()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', String(timestamp))
  formData.append('upload_preset', uploadPreset)
  formData.append('signature', signature)

  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, { method: 'POST', body: formData })
  const data = await up.json()
  if (!up.ok) throw new Error(data?.error?.message || 'Upload failed')
  return data.secure_url as string
}
```

---

## Products API

`app/api/products/route.ts`

```ts
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET() {
  await dbConnect()
  const docs = await Product.find({}).sort({ createdAt: -1 }).lean()
  const normalized = docs.map((d: any) => ({
    ...d,
    id: String(d._id),
    images: Array.isArray(d.images) && d.images.length ? d.images : (d.image ? [d.image] : []),
  }))
  return NextResponse.json(normalized)
}

export async function POST(req: Request) {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  if (!body.name || !body.slug || !body.price) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (!Array.isArray(body.images) || body.images.length === 0) return NextResponse.json({ error: 'Images required' }, { status: 400 })

  body.image = body.images[0]
  const created = await Product.create(body)
  return NextResponse.json({ ...created.toObject(), id: String(created._id) }, { status: 201 })
}
```

`app/api/products/[idOrSlug]/route.ts`

```ts
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Product from '@/lib/models/Product'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { idOrSlug: string } }) {
  await dbConnect()
  const key = params.idOrSlug?.trim()
  if (!key) return NextResponse.json({ error: 'Missing parameter' }, { status: 400 })

  const query = /^[0-9a-fA-F]{24}$/.test(key) ? { _id: key } : { slug: key.toLowerCase() }
  const p: any = await Product.findOne(query).lean()
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...p,
    id: String(p._id),
    images: Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []),
  })
}

export async function PUT(req: Request, { params }: { params: { idOrSlug: string } }) {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const key = params.idOrSlug
  const query = /^[0-9a-fA-F]{24}$/.test(key) ? { _id: key } : { slug: key.toLowerCase() }
  const updated = await Product.findOneAndUpdate(query, body, { new: true })
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { idOrSlug: string } }) {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const key = params.idOrSlug
  const query = /^[0-9a-fA-F]{24}$/.test(key) ? { _id: key } : { slug: key.toLowerCase() }
  await Product.findOneAndDelete(query)
  return new NextResponse(null, { status: 204 })
}
```

---

## Orders API

`app/api/orders/route.ts`

```ts
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import { getSessionFromCookies } from '@/lib/auth'

export async function POST(req: Request) {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { items, subtotal, shippingAddress, billingAddress, note } = await req.json()
  const order = await Order.create({
    userId: s.userId,
    items,
    subtotal,
    shippingAddress,
    billingAddress,
    note,
  })
  return NextResponse.json({ ...order.toObject(), id: String(order._id) }, { status: 201 })
}

export async function GET() {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean()
  const normalized = orders.map((o: any) => ({ ...o, id: String(o._id) }))
  return NextResponse.json(normalized)
}
```

`app/api/orders/[id]/route.ts`

```ts
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import Order from '@/lib/models/Order'
import { getSessionFromCookies } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const order: any = await Order.findById(params.id).lean()
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = String(order.userId) === s.userId
  const isAdmin = s.role === 'admin'
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ ...order, id: String(order._id) })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await dbConnect()
  const s = getSessionFromCookies()
  if (!s || s.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const updated = await Order.findByIdAndUpdate(params.id, body, { new: true })
  return NextResponse.json(updated)
}
```

---

## Auth API (example)

* `app/api/auth/register/route.ts` — create user with `bcrypt` hash.
* `app/api/auth/login/route.ts` — verify, create JWT, set `cookies().set('session', token, { ...httpOnly })`.
* `app/api/auth/logout/route.ts` — clear cookie.

---

## Route Protection (`middleware.ts`)

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const protectedPaths = ['/cart','/checkout','/orders','/admin']
  const isProtected = protectedPaths.some(p => url.pathname.startsWith(p))

  if (!isProtected) return NextResponse.next()

  const token = req.cookies.get('session')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    const payload: any = jwt.verify(token, JWT_SECRET)
    if (url.pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/cart/:path*','/checkout/:path*','/orders/:path*','/admin/:path*']
}
```

---

## Cart (Persisted)

`lib/cart/context.tsx` (IDs only `{ id, qty, size? }`, hydrate later):

```ts
'use client'
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

export type CartItemStored = { id: string; qty: number; size?: string }
type State = { items: CartItemStored[] }
type Action =
  | { type: 'ADD'; id: string; qty?: number; size?: string }
  | { type: 'REMOVE'; id: string }
  | { type: 'UPDATE_QTY'; id: string; qty: number }
  | { type: 'CLEAR' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD': {
      const found = state.items.find(i => i.id === action.id && i.size === action.size)
      if (found) {
        return { items: state.items.map(i => i === found ? { ...i, qty: i.qty + (action.qty ?? 1) } : i) }
      }
      return { items: [...state.items, { id: action.id, qty: action.qty ?? 1, size: action.size }] }
    }
    case 'REMOVE': return { items: state.items.filter(i => i.id !== action.id) }
    case 'UPDATE_QTY': return { items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) }
    case 'CLEAR': return { items: [] }
    default: return state
  }
}

const STORAGE_KEY = 'fashion_store_cart_v1'
const Ctx = createContext<{
  items: CartItemStored[]
  add: (id: string, qty?: number, size?: string) => void
  remove: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clear: () => void
} | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as State
        if (Array.isArray(parsed.items)) parsed.items.forEach(it => dispatch({ type: 'ADD', id: it.id, qty: it.qty, size: it.size }))
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(() => ({
    items: state.items,
    add: (id: string, qty = 1, size?: string) => dispatch({ type: 'ADD', id, qty, size }),
    remove: (id: string) => dispatch({ type: 'REMOVE', id }),
    updateQty: (id: string, qty: number) => dispatch({ type: 'UPDATE_QTY', id, qty }),
    clear: () => dispatch({ type: 'CLEAR' }),
  }), [state])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be inside CartProvider')
  return c
}
```

`lib/cart/hooks.ts` (hydrate):

```ts
'use client'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from './context'
import { apiFetch } from '@/lib/api'

export function useCartDetails() {
  const { items, ...mut } = useCart()
  const [products, setProducts] = useState<Record<string, any>>({})

  useEffect(() => {
    let ignore = false
    ;(async () => {
      const map: Record<string, any> = {}
      for (const it of items) {
        if (!map[it.id]) {
          const res = await apiFetch(`/api/products/${it.id}`)
          if (res.ok) {
            const p = await res.json()
            map[it.id] = p
          }
        }
      }
      if (!ignore) setProducts(map)
    })()
    return () => { ignore = true }
  }, [items])

  const enriched = useMemo(() => {
    return items.map(it => ({ ...it, product: products[it.id] })).filter(r => r.product)
  }, [items, products])

  const subtotalCents = enriched.reduce((n, r) => n + r.qty * r.product.price, 0)
  return { enriched, subtotalCents, ...mut }
}
```

---

## Welcome Splash (`components/WelcomeGate.tsx`)

* Show **once** after login (2s), then set `sessionStorage.setItem('welcomed','1')`.
* Use your brand logo (provided) and colors with a simple motion animation.

*(Codex: build a simple full-screen overlay with fade/scale animation, auto-hide after 2000ms, only if `!sessionStorage.getItem('welcomed')` and user is logged in. The component mounts on Home page.)*

---

## Category Card (`components/CategoryCard.tsx`)

* Props: `{ name: string; href: string; image: string }`
* Mobile-first card with image (16:9), label overlay.

---

## Admin Guard

* `app/admin/layout.tsx` should fetch `/api/auth/me` or read cookie on server to check role. If not admin → redirect `/`.

---

## Dev Admin Seeder

`app/api/dev/seed-admin/route.ts` (only if `ALLOW_ADMIN_SEED=true`):

```ts
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export async function POST() {
  if (process.env.ALLOW_ADMIN_SEED !== 'true') return NextResponse.json({ error: 'Disabled' }, { status: 403 })
  await dbConnect()
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  if (!email) return NextResponse.json({ error: 'ADMIN_EMAIL not set' }, { status: 400 })
  const exists = await User.findOne({ email })
  if (exists) return NextResponse.json({ ok: true, note: 'Already exists' })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name: 'Admin', email, passwordHash, role: 'admin' })
  return NextResponse.json({ ok: true, id: String(user._id) })
}
```

---

## Deployment (Vercel)

* Add environment variables in Vercel project settings.
* Ensure `next.config.js` has `res.cloudinary.com` in `images.remotePatterns`.
* Use **Hobby (free)** plan: serverless functions OK for Atlas & Cloudinary.

---

## Acceptance Criteria

* All pages are mobile-first and responsive.
* Auth works; protected routes redirect correctly.
* Cloudinary uploads are **signed**, not unsigned.
* Cart persists in localStorage; checkout creates order document.
* Users see **WelcomeGate** once after fresh login → home.
* Admin can create/edit/delete products (multi images) and edit orders.
* API responses are normalized (always include `id: string`, `images: string[]`).

---

> **Codex, generate the entire codebase following this README.**
> Use modern, clean UI, simple Tailwind components, and keep `"use client"` only where needed.


