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
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10));

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

    const productMap = {};

    for (const order of orders) {
      try {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        if (Array.isArray(items)) {
          for (const item of items) {
            const name = (item.name || item.title || item.itemName || 'Unknown Product').trim();
            const category = (item.category || item.categoryName || 'General').trim();
            const qty = Number(item.quantity ?? item.qty ?? item.count ?? 1);
            const unitPrice = Number(item.price ?? item.unitPrice ?? 0);
            const itemRevenue = item.total !== undefined ? Number(item.total) : (unitPrice * qty);

            const key = name.toLowerCase();
            if (!productMap[key]) {
              productMap[key] = {
                name,
                category,
                quantity: 0,
                revenue: 0
              };
            }
            productMap[key].quantity += qty;
            productMap[key].revenue += itemRevenue;
          }
        }
      } catch (e) {
        // Safe handling of any JSON parse error
      }
    }

    const sortedProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map(p => ({
        ...p,
        revenue: Math.round(p.revenue * 100) / 100
      }));

    return NextResponse.json({
      success: true,
      products: sortedProducts
    });
  } catch (err) {
    console.error('API /dashboard/products error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
