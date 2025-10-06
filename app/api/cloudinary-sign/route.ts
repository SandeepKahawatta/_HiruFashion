import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, NEXT_PUBLIC_UPLOAD_PRESET } = process.env

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !NEXT_PUBLIC_UPLOAD_PRESET) {
  console.warn('Cloudinary environment variables are not fully configured')
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
})

export async function GET(request: NextRequest) {
  if (!CLOUDINARY_API_SECRET || !CLOUDINARY_API_KEY || !CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }
  const url = request.nextUrl
  const timestamp = Math.round(Date.now() / 1000)
  const folder = url.searchParams.get('folder') || 'hirufashion/uploads'
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
    upload_preset: NEXT_PUBLIC_UPLOAD_PRESET || ''
  }
  const signature = cloudinary.utils.api_sign_request(paramsToSign, CLOUDINARY_API_SECRET)
  return NextResponse.json({
    timestamp,
    signature,
    apiKey: CLOUDINARY_API_KEY,
    cloudName: CLOUDINARY_CLOUD_NAME,
    uploadPreset: NEXT_PUBLIC_UPLOAD_PRESET,
    folder
  })
}
