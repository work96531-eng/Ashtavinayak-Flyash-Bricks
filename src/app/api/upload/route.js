import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload directly to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_srYEAURGvG9t9jpR_Sy6rcgI5t2fPfMbdxLXK6GIhhjrjG5"
    });

    return NextResponse.json({ url: blob.url, filename: file.name });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
  }
}
