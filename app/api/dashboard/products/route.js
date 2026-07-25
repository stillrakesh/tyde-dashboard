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
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10));
    const search = url.searchParams.get('search')?.trim().toLowerCase() || '';
    const categoryFilter = url.searchParams.get('category')?.trim().toLowerCase() || '';

    let orders = await prisma.syncedOrder.findMany({
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

    if (orders.length === 0) {
      orders = await prisma.syncedOrder.findMany({
        where: {
          accountId: account.id,
          NOT: {
            status: {
              in: ['cancelled', 'CANCELLED', 'refunded', 'REFUNDED']
            }
          }
        }
      });
    }

    const productMap = {};
    let totalRevenue = 0;
    let totalUnits = 0;

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

            totalRevenue += itemRevenue;
            totalUnits += qty;

            const key = name.toLowerCase();
            if (!productMap[key]) {
              productMap[key] = {
                name,
                category,
                quantity: 0,
                revenue: 0,
                unitPrice: unitPrice || (qty > 0 ? itemRevenue / qty : 0)
              };
            }
            productMap[key].quantity += qty;
            productMap[key].revenue += itemRevenue;
          }
        }
      } catch (e) {
        // Safe handling
      }
    }

    let productsList = Object.values(productMap);

    if (search) {
      productsList = productsList.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));
    }

    if (categoryFilter && categoryFilter !== 'all') {
      productsList = productsList.filter(p => p.category.toLowerCase() === categoryFilter);
    }

    const categories = Array.from(new Set(Object.values(productMap).map(p => p.category))).sort();

    const sortedProducts = productsList
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((p, index) => ({
        rank: index + 1,
        ...p,
        unitsSold: p.quantity,
        revenue: Math.round(p.revenue * 100) / 100,
        unitPrice: Math.round(p.unitPrice * 100) / 100,
        contributionPercentage: totalRevenue > 0 ? Math.round((p.revenue / totalRevenue) * 100 * 10) / 10 : 0
      }));

    return NextResponse.json({
      success: true,
      products: sortedProducts,
      categories,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalUnits,
        totalProducts: productsList.length
      }
    });
  } catch (err) {
    console.error('API /dashboard/products error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
