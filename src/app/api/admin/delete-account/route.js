import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// DELETE — remove an admin account; if PRIMARY deletes themselves, SECONDARY is promoted
export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const uid = cookieStore.get('admin-uid')?.value;
    const role = cookieStore.get('admin-role')?.value;
    if (!uid) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = await prisma.adminUser.findUnique({ where: { uid } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Delete the user
    await prisma.adminUser.delete({ where: { uid } });

    // If PRIMARY is deleting themselves, promote the SECONDARY to PRIMARY
    if (role === 'PRIMARY') {
      const secondary = await prisma.adminUser.findFirst({
        where: { role: 'SECONDARY', status: 'APPROVED' }
      });
      if (secondary) {
        await prisma.adminUser.update({
          where: { id: secondary.id },
          data: { role: 'PRIMARY', status: 'APPROVED' }
        });
      }
    }

    // Clear cookies
    cookieStore.delete('admin-uid');
    cookieStore.delete('admin-email');
    cookieStore.delete('admin-role');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
