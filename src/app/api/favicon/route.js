import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const settings = await prisma.settings.findFirst();
    let logoUrl = settings?.logoUrl || '/logo.png';
    let logoShape = settings?.logoShape || 'square';
    
    let imageBuffer;
    let mimeType = 'image/png';
    
    // Read the image file and convert it to Base64
    if (logoUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', logoUrl);
      if (fs.existsSync(filePath)) {
        imageBuffer = fs.readFileSync(filePath);
        mimeType = (logoUrl.endsWith('.jpg') || logoUrl.endsWith('.jpeg')) ? 'image/jpeg' : 'image/png';
      }
    } else if (logoUrl.startsWith('/logo.png')) {
      const filePath = path.join(process.cwd(), 'public', 'logo.png');
      if (fs.existsSync(filePath)) {
        imageBuffer = fs.readFileSync(filePath);
        mimeType = 'image/png';
      }
    } else if (logoUrl.startsWith('http')) {
      const res = await fetch(logoUrl);
      const arrayBuffer = await res.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      mimeType = res.headers.get('content-type') || 'image/png';
    }

    if (!imageBuffer) {
      return new NextResponse('Icon not found', { status: 404 });
    }

    const base64 = imageBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    let clipPath = `<rect x="0" y="0" width="100" height="100" />`; // square
    if (logoShape === 'circle') {
      clipPath = `<circle cx="50" cy="50" r="50" />`;
    } else if (logoShape === 'rounded') {
      clipPath = `<rect x="0" y="0" width="100" height="100" rx="20" ry="20" />`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <clipPath id="shape">
      ${clipPath}
    </clipPath>
  </defs>
  <image href="${dataUri}" width="100" height="100" preserveAspectRatio="xMidYMid slice" clip-path="url(#shape)" />
</svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error("Favicon generator error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
