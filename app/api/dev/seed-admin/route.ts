import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/db'
import User from '@/lib/models/User'

export async function POST() {
  if (process.env.ALLOW_ADMIN_SEED !== 'true') {
    return NextResponse.json({ error: 'Disabled' }, { status: 403 })
  }
  await dbConnect()
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  if (!email) {
    return NextResponse.json({ error: 'ADMIN_EMAIL not set' }, { status: 400 })
  }
  const exists = await User.findOne({ email })
  if (exists) {
    return NextResponse.json({ ok: true, note: 'Already exists' })
  }
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name: 'Admin', email, passwordHash, role: 'admin' })
  return NextResponse.json({ ok: true, id: String(user._id) })
}
