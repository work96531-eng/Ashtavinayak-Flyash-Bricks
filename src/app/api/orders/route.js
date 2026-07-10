import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // In a real application, you would calculate total price server-side
    // and validate items. For now, we trust the client for prototype purposes.
    
    const order = await prisma.order.create({
      data: {
        customerName: data.customerName || 'Guest',
        phone: data.phone || 'N/A',
        address: data.address,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        distance: parseFloat(data.distance),
        totalPrice: parseFloat(data.totalPrice || 0),
        items: JSON.stringify(data.items || []),
        status: 'PENDING'
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
