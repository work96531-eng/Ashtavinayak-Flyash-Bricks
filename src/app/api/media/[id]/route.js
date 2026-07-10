import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const media = await prisma.media.update({
      where: { id },
      data: {
        isActive: data.isActive,
        title: data.title,
        sortOrder: data.sortOrder,
      }
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
