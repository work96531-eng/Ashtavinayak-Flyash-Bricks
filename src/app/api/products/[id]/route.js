import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single product
export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT update product
export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        specifications: data.specifications,
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
