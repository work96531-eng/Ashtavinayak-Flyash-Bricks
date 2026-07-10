import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// POST — PRIMARY approves or rejects a SECONDARY user
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('admin-role')?.value;
    if (role !== 'PRIMARY') return NextResponse.json({ error: 'Only PRIMARY admin can approve' }, { status: 403 });

    const { userId, action } = await request.json(); // action: 'approve' | 'reject'
    if (!userId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const updated = await prisma.adminUser.update({
      where: { id: userId },
      data: { status: newStatus }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
