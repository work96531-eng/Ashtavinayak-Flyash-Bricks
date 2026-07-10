import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// GET — fetch all admin users (PRIMARY only)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get('admin-role')?.value;
    if (role !== 'PRIMARY') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
