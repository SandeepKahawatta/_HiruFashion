import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set')
}

let cached = (global as typeof globalThis & { mongooseConn?: typeof mongoose }).mongooseConn

export async function dbConnect() {
  if (cached && mongoose.connection.readyState === 1) {
    return cached
  }
  if (!cached) {
    cached = await mongoose.connect(MONGODB_URI)
    ;(global as typeof globalThis & { mongooseConn?: typeof mongoose }).mongooseConn = cached
  }
  return cached
}
