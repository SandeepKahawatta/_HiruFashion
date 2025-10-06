import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { dbConnect } from './db'
import User, { UserDoc } from './models/User'

export const AUTH_COOKIE = 'hf_auth'

export type TokenPayload = {
  id: string
  email: string
  role: 'user' | 'admin'
  name: string
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET not configured')
  return secret
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSecret()) as TokenPayload
  } catch (err) {
    console.error('Failed to verify token', err)
    return null
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    maxAge: 0,
    path: '/'
  })
}

export async function getUserFromCookies() {
  const token = cookies().get(AUTH_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  await dbConnect()
  const user = await User.findById(payload.id).lean<UserDoc | null>()
  if (!user) return null
  return normalizeUser(user)
}

export async function requireUser(req: NextRequest, options: { admin?: boolean } = {}) {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  if (options.admin && payload.role !== 'admin') return null
  await dbConnect()
  const user = await User.findById(payload.id).lean<UserDoc | null>()
  if (!user) return null
  return normalizeUser(user)
}

export function normalizeUser(user: UserDoc) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as 'user' | 'admin'
  }
}

export function buildAuthResponse(data: Record<string, unknown>, token?: string) {
  const res = NextResponse.json(data)
  if (token) {
    setAuthCookie(res, token)
  }
  return res
}
