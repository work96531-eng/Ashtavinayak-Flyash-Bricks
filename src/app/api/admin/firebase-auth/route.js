import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFirebaseToken } from '@/lib/firebase-verify';
import { cookies } from 'next/headers';

const MAX_ADMINS = 2;

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return NextResponse.json({ error: 'No token provided' }, { status: 400 });

    // Verify Firebase token
    const firebaseUser = await verifyFirebaseToken(idToken);
    if (!firebaseUser) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const { uid, email } = firebaseUser;

    // Check if this user already exists in our DB
    let adminUser = await prisma.adminUser.findUnique({ where: { uid } });

    if (adminUser) {
      // Existing user — check status
      if (adminUser.status === 'REJECTED') {
        return NextResponse.json({ error: 'Your access has been rejected by the primary admin.' }, { status: 403 });
      }
      if (adminUser.status === 'PENDING') {
        return NextResponse.json({ error: 'pending', message: 'Your signup request is awaiting approval from the primary admin.' }, { status: 403 });
      }
      // APPROVED — set session cookie and allow in
      const cookieStore = await cookies();
      cookieStore.set('admin-uid', uid, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('admin-email', email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('admin-role', adminUser.role, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return NextResponse.json({ success: true, role: adminUser.role, email });
    }

    // New user — check how many admins exist
    const allAdmins = await prisma.adminUser.findMany();

    if (allAdmins.length >= MAX_ADMINS) {
      return NextResponse.json({ error: 'Maximum admin accounts (2) reached. Contact the primary admin.' }, { status: 403 });
    }

    if (allAdmins.length === 0) {
      // First user ever — becomes PRIMARY, auto-approved
      adminUser = await prisma.adminUser.create({
        data: { uid, email, role: 'PRIMARY', status: 'APPROVED' }
      });
      const cookieStore = await cookies();
      cookieStore.set('admin-uid', uid, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('admin-email', email, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      cookieStore.set('admin-role', 'PRIMARY', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
      return NextResponse.json({ success: true, role: 'PRIMARY', email, isNew: true });
    }

    // Second user — create PENDING request
    adminUser = await prisma.adminUser.create({
      data: { uid, email, role: 'SECONDARY', status: 'PENDING' }
    });
    return NextResponse.json({
      error: 'pending',
      message: 'Your signup request has been sent to the primary admin for approval. Please wait.'
    }, { status: 202 });

  } catch (error) {
    console.error('Firebase auth error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
