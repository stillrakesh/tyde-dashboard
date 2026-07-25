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

    const fromParam = url.searchParams.get('from');
    const toParam = url.searchParams.get('to');
    let groupByParam = url.searchParams.get('groupBy');

    if (!groupByParam) {
      if (fromParam && toParam && fromParam === toParam) {
        groupByParam = 'hourly';
      } else {
        groupByParam = 'daily';
      }
    }

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
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    let trends = [];

    if (groupByParam === 'hourly') {
      const hoursMap = {};
      for (let h = 0; h < 24; h++) {
        const hourStr = String(h).padStart(2, '0') + ':00';
        hoursMap[hourStr] = { hour: hourStr, revenue: 0, orders: 0 };
      }

      for (const order of orders) {
        const d = new Date(order.created_at);
        const hourStr = String(d.getHours()).padStart(2, '0') + ':00';
        if (hoursMap[hourStr]) {
          hoursMap[hourStr].revenue += order.grandTotal || 0;
          hoursMap[hourStr].orders += 1;
        }
      }

      trends = Object.values(hoursMap).map(t => ({
        ...t,
        revenue: Math.round(t.revenue * 100) / 100
      }));
    } else {
      const map = new Map();
      const formatDateKey = (d) => {
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mo}-${dy}`;
      };

      const curr = new Date(startDate);
      while (curr <= endDate) {
        const key = formatDateKey(curr);
        map.set(key, { date: key, revenue: 0, orders: 0 });
        curr.setDate(curr.getDate() + 1);
      }

      for (const order of orders) {
        const key = formatDateKey(new Date(order.created_at));
        if (!map.has(key)) {
          map.set(key, { date: key, revenue: 0, orders: 0 });
        }
        const entry = map.get(key);
        entry.revenue += order.grandTotal || 0;
        entry.orders += 1;
      }

      trends = Array.from(map.values()).map(t => ({
        ...t,
        revenue: Math.round(t.revenue * 100) / 100
      }));
    }

    return NextResponse.json({
      success: true,
      groupBy: groupByParam,
      trends
    });
  } catch (err) {
    console.error('API /dashboard/trend error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
