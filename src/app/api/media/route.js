import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const media = await prisma.media.create({
      data: {
        title: data.title || '',
        url: data.url,
        type: data.type || 'IMAGE',
        isActive: data.isActive !== false,
        sortOrder: parseInt(data.sortOrder) || 0,
      }
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
