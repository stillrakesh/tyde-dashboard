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
    const isAll = url.searchParams.get('all') === 'true';

    if (isAll) {
      const rawOrders = await prisma.syncedOrder.findMany({
        where: { accountId: account.id },
        orderBy: { created_at: 'desc' }
      });

      const orders = rawOrders.map(order => {
        let parsedItems = [];
        try {
          parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        } catch (e) {}

        let parsedSplitPayments = null;
        if (order.splitPayments) {
          try {
            parsedSplitPayments = typeof order.splitPayments === 'string' ? JSON.parse(order.splitPayments) : order.splitPayments;
          } catch (e) {}
        }

        return {
          id: order.id,
          localOrderId: Number(order.localOrderId),
          tableNumber: order.tableNumber,
          items: parsedItems,
          grandTotal: order.grandTotal,
          subtotal: order.subtotal,
          paymentMethod: order.paymentMethod,
          splitPayments: parsedSplitPayments,
          status: order.status,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          gstAmount: order.gstAmount,
          serviceChargeAmount: order.serviceChargeAmount,
          discountAmount: order.discountAmount,
          tipAmount: order.tipAmount,
          roundOff: order.roundOff,
          covers: order.covers,
          orderType: order.orderType,
          created_at: order.created_at
        };
      });

      return NextResponse.json({
        success: true,
        orders
      });
    }

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
      where.orderType = { contains: orderType, mode: 'insensitive' };
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

    let total = await prisma.syncedOrder.count({ where });

    if (total === 0) {
      delete where.created_at;
      total = await prisma.syncedOrder.count({ where });
    }

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
      } catch (e) {}

      let parsedSplitPayments = null;
      if (order.splitPayments) {
        try {
          parsedSplitPayments = typeof order.splitPayments === 'string' ? JSON.parse(order.splitPayments) : order.splitPayments;
        } catch (e) {}
      }

      return {
        id: order.id,
        localOrderId: Number(order.localOrderId),
        tableNumber: order.tableNumber,
        items: parsedItems,
        grandTotal: Math.round((order.grandTotal || 0) * 100) / 100,
        subtotal: Math.round((order.subtotal || 0) * 100) / 100,
        paymentMethod: order.paymentMethod || 'Cash',
        splitPayments: parsedSplitPayments,
        status: order.status || 'completed',
        customerName: order.customerName || '',
        customerPhone: order.customerPhone || '',
        gstAmount: Math.round((order.gstAmount || 0) * 100) / 100,
        serviceChargeAmount: Math.round((order.serviceChargeAmount || 0) * 100) / 100,
        discountAmount: Math.round((order.discountAmount || 0) * 100) / 100,
        tipAmount: Math.round((order.tipAmount || 0) * 100) / 100,
        roundOff: order.roundOff || 0,
        covers: order.covers || 1,
        orderType: order.orderType || 'Dine In',
        created_at: order.created_at
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
