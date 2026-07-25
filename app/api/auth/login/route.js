import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, account.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const accountData = {
      id: account.id,
      email: account.email,
      restaurantName: account.restaurantName,
      apiKey: account.apiKey
    };

    const token = signToken(accountData);

    return NextResponse.json({
      success: true,
      token,
      account: accountData
    });
  } catch (err) {
    console.error('API /auth/login error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
