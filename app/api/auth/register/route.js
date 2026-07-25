import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateApiKey } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, restaurantName } = body || {};

    if (!email || !password || !restaurantName) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Email, password, and restaurant name are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.account.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'CONFLICT', message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const apiKey = generateApiKey();

    const account = await prisma.account.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        restaurantName: restaurantName.trim(),
        apiKey
      }
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        email: account.email,
        restaurantName: account.restaurantName,
        apiKey: account.apiKey
      }
    });
  } catch (err) {
    console.error('API /auth/register error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
