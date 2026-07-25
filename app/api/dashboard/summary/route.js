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

    const { startDate, endDate } = parseDateRange(req.url);

    const orders = await prisma.syncedOrder.findMany({
      where: {
        accountId: account.id,
        created_at: {
          gte: startDate,
          lte: endDate
        },
        NOT: {
          status: {
            in: ['cancelled', 'CANCELLED', 'refunded', 'REFUNDED']
          }
        }
      }
    });

    let revenue = 0;
    let itemsSold = 0;
    let gst = 0;
    let sc = 0;
    const paymentBreakdown = {};

    for (const order of orders) {
      revenue += order.grandTotal || 0;
      gst += order.gstAmount || 0;
      sc += order.serviceChargeAmount || 0;

      const pm = order.paymentMethod || 'Unknown';
      paymentBreakdown[pm] = (paymentBreakdown[pm] || 0) + (order.grandTotal || 0);

      try {
        const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        if (Array.isArray(parsedItems)) {
          for (const item of parsedItems) {
            const qty = Number(item.quantity ?? item.qty ?? item.count ?? 1);
            itemsSold += qty;
          }
        }
      } catch (e) {
        // Safe JSON fallback
      }
    }

    const orderCount = orders.length;
    const aov = orderCount > 0 ? revenue / orderCount : 0;

    return NextResponse.json({
      success: true,
      summary: {
        revenue: Math.round(revenue * 100) / 100,
        orderCount,
        aov: Math.round(aov * 100) / 100,
        itemsSold,
        gst: Math.round(gst * 100) / 100,
        sc: Math.round(sc * 100) / 100,
        paymentBreakdown
      }
    });
  } catch (err) {
    console.error('API /dashboard/summary error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
