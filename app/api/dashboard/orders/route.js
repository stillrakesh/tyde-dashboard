import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate, parseDateRange } from '@/lib/auth';

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
    const { startDate, endDate } = parseDateRange(req.url);
    const status = url.searchParams.get('status')?.trim();
    const paymentMethod = url.searchParams.get('paymentMethod')?.trim();
    const orderType = url.searchParams.get('orderType')?.trim() || url.searchParams.get('type')?.trim();
    const search = url.searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10));

    const where = {
      accountId: account.id,
      created_at: {
        gte: startDate,
        lte: endDate
      }
    };

    if (status && status !== 'all') {
      where.status = { equals: status, mode: 'insensitive' };
    }

    if (paymentMethod && paymentMethod !== 'all') {
      where.paymentMethod = { contains: paymentMethod, mode: 'insensitive' };
    }

    if (orderType && orderType !== 'all') {
      const typeLower = orderType.toLowerCase();
      if (typeLower.includes('dine')) {
        where.AND = (where.AND || []).concat([
          { NOT: { tableNumber: { contains: 'takeaway', mode: 'insensitive' } } },
          { NOT: { tableNumber: { contains: 'pickup', mode: 'insensitive' } } },
          { NOT: { tableNumber: { contains: 'delivery', mode: 'insensitive' } } },
          { NOT: { tableNumber: { contains: 'parcel', mode: 'insensitive' } } }
        ]);
      } else if (typeLower.includes('take') || typeLower.includes('pick') || typeLower.includes('parcel')) {
        where.OR = (where.OR || []).concat([
          { tableNumber: { contains: 'takeaway', mode: 'insensitive' } },
          { tableNumber: { contains: 'pickup', mode: 'insensitive' } },
          { tableNumber: { contains: 'parcel', mode: 'insensitive' } }
        ]);
      } else if (typeLower.includes('deliver')) {
        where.tableNumber = { contains: 'delivery', mode: 'insensitive' };
      }
    }

    if (search) {
      const isNum = !isNaN(Number(search));
      const searchConditions = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { tableNumber: { contains: search, mode: 'insensitive' } }
      ];
      if (isNum) {
        searchConditions.push({ localOrderId: BigInt(search) });
      }
      where.AND = (where.AND || []).concat([{ OR: searchConditions }]);
    }

    const total = await prisma.syncedOrder.count({ where });

    const rawOrders = await prisma.syncedOrder.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const orders = rawOrders.map(order => {
      let parsedItems = [];
      try {
        parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
      } catch (e) {
        parsedItems = [];
      }

      const tblLower = String(order.tableNumber || '').toLowerCase();
      let derivedType = 'Dine In';
      if (tblLower.includes('delivery')) derivedType = 'Delivery';
      else if (tblLower.includes('takeaway') || tblLower.includes('pickup') || tblLower.includes('parcel')) derivedType = 'Takeaway';

      return {
        ...order,
        localOrderId: Number(order.localOrderId),
        orderType: derivedType,
        items: parsedItems,
        grandTotal: Math.round(order.grandTotal * 100) / 100,
        gstAmount: Math.round(order.gstAmount * 100) / 100,
        serviceChargeAmount: Math.round(order.serviceChargeAmount * 100) / 100,
        discountAmount: Math.round(order.discountAmount * 100) / 100,
        tipAmount: Math.round(order.tipAmount * 100) / 100
      };
    });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    console.error('API /dashboard/orders error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
