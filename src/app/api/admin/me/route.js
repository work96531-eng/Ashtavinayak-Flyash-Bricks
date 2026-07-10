import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET — return current admin info from cookies
export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({
    uid: cookieStore.get('admin-uid')?.value || null,
    email: cookieStore.get('admin-email')?.value || null,
    role: cookieStore.get('admin-role')?.value || null,
  });
}
