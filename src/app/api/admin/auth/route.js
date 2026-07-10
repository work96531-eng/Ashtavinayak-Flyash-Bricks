import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Legacy POST — kept for backward compat, now just checks cookie
export async function POST(request) {
  return NextResponse.json({ error: 'Use Firebase authentication' }, { status: 400 });
}

// DELETE — sign out: clear all admin session cookies
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-uid');
  cookieStore.delete('admin-email');
  cookieStore.delete('admin-role');
  cookieStore.delete('admin_auth');
  return NextResponse.json({ success: true });
}
