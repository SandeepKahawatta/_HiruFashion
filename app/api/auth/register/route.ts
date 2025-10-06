import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'
import { buildAuthResponse, normalizeUser, signToken } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { name, email, password } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  await dbConnect()
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'user'
  })
  const payload = {
    id: String(user._id),
    email: user.email,
    role: user.role as 'user' | 'admin',
    name: user.name
  }
  const token = signToken(payload)
  return buildAuthResponse({ user: normalizeUser(user) }, token)
}
