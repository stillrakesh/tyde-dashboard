import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function GET(req) {
  try {
    const account = await authenticate(req);
    if (!account) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10));

    const where = {
      accountId: account.id
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const total = await prisma.syncedCustomer.count({ where });
    const customers = await prisma.syncedCustomer.findMany({
      where,
      orderBy: {
        totalSpent: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const formattedCustomers = customers.map(c => ({
      ...c,
      totalSpent: Math.round(c.totalSpent * 100) / 100
    }));

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    console.error('API /dashboard/customers error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
