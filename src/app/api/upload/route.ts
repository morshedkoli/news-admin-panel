import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  width?: number
  height?: number
  bytes?: number
  format?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`)

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'news-app',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Cloudinary upload success:', result?.public_id)
            resolve(result as CloudinaryUploadResult)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({ 
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      size: result.bytes,
      format: result.format
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}