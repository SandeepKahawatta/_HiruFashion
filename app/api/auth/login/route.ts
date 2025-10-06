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
  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }
  await dbConnect()
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const token = signToken({
    id: String(user._id),
    email: user.email,
    role: user.role as 'user' | 'admin',
    name: user.name
  })
  return buildAuthResponse({ user: normalizeUser(user) }, token)
}
