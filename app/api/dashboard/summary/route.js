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

    // Current period orders
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

    // Previous period calculation for trend
    const duration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - duration);
    const prevEndDate = new Date(startDate.getTime() - 1);

    const prevOrders = await prisma.syncedOrder.findMany({
      where: {
        accountId: account.id,
        created_at: {
          gte: prevStartDate,
          lte: prevEndDate
        },
        NOT: {
          status: {
            in: ['cancelled', 'CANCELLED', 'refunded', 'REFUNDED']
          }
        }
      },
      select: {
        grandTotal: true
      }
    });

    const prevRevenue = prevOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0);

    let revenue = 0;
    let gst = 0;
    let sc = 0;
    let itemsSold = 0;
    let dineInRevenue = 0;
    let takeawayRevenue = 0;
    const paymentBreakdown = { Cash: 0, UPI: 0, Card: 0, Split: 0 };
    const itemMap = {};
    const trendMap = new Map();

    const isTakeaway = (tbl) => {
      if (!tbl) return false;
      const lower = String(tbl).toLowerCase();
      return (
        lower.includes('takeaway') ||
        lower.includes('pickup') ||
        lower.includes('delivery') ||
        lower.includes('parcel') ||
        lower.includes('express')
      );
    };

    const isSingleDay = startDate.toDateString() === endDate.toDateString();

    const formatDateKey = (d) => {
      if (isSingleDay) {
        return String(d.getHours()).padStart(2, '0') + ':00';
      }
      const yr = d.getFullYear();
      const mo = String(d.getMonth() + 1).padStart(2, '0');
      const dy = String(d.getDate()).padStart(2, '0');
      return `${yr}-${mo}-${dy}`;
    };

    for (const order of orders) {
      const gTotal = order.grandTotal || 0;
      const orderGst = order.gstAmount || 0;
      const orderSc = order.serviceChargeAmount || 0;

      revenue += gTotal;
      gst += orderGst;
      sc += orderSc;

      if (isTakeaway(order.tableNumber)) {
        takeawayRevenue += gTotal;
      } else {
        dineInRevenue += gTotal;
      }

      const pm = order.paymentMethod || 'Cash';
      // Normalize payment method key
      let pmKey = 'Cash';
      const pmLower = pm.toLowerCase();
      if (pmLower.includes('upi') || pmLower.includes('gpay') || pmLower.includes('phonepe') || pmLower.includes('paytm') || pmLower.includes('qr')) {
        pmKey = 'UPI';
      } else if (pmLower.includes('card') || pmLower.includes('credit') || pmLower.includes('debit') || pmLower.includes('pos')) {
        pmKey = 'Card';
      } else if (pmLower.includes('split') || pmLower.includes('mult')) {
        pmKey = 'Split';
      } else if (pmLower.includes('cash')) {
        pmKey = 'Cash';
      } else {
        pmKey = pm;
      }
      paymentBreakdown[pmKey] = (paymentBreakdown[pmKey] || 0) + gTotal;

      // Items parsing
      try {
        const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        if (Array.isArray(parsedItems)) {
          for (const item of parsedItems) {
            const name = (item.name || item.title || item.itemName || 'Unknown Item').trim();
            const category = (item.category || item.categoryName || 'General').trim();
            const qty = Number(item.quantity ?? item.qty ?? item.count ?? 1);
            const price = Number(item.price ?? item.unitPrice ?? 0);
            const totalItemRev = item.total !== undefined ? Number(item.total) : (price * qty);

            itemsSold += qty;

            const itemKey = name.toLowerCase();
            if (!itemMap[itemKey]) {
              itemMap[itemKey] = { name, category, quantity: 0, revenue: 0 };
            }
            itemMap[itemKey].quantity += qty;
            itemMap[itemKey].revenue += totalItemRev;
          }
        }
      } catch (e) {
        // Safe JSON parsing
      }

      // Revenue Trend aggregation
      const timeKey = formatDateKey(new Date(order.created_at));
      if (!trendMap.has(timeKey)) {
        trendMap.set(timeKey, { date: timeKey, revenue: 0, orders: 0 });
      }
      const tEntry = trendMap.get(timeKey);
      tEntry.revenue += gTotal;
      tEntry.orders += 1;
    }

    const orderCount = orders.length;
    const aov = orderCount > 0 ? revenue / orderCount : 0;
    const netSales = Math.max(0, revenue - gst - sc);
    const trend = prevRevenue > 0
      ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100 * 10) / 10
      : (revenue > 0 ? 100 : 0);

    const topItems = Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(item => ({
        ...item,
        revenue: Math.round(item.revenue * 100) / 100,
        contribution: revenue > 0 ? Math.round((item.revenue / revenue) * 100 * 10) / 10 : 0
      }));

    // Format payment breakdown
    Object.keys(paymentBreakdown).forEach(k => {
      paymentBreakdown[k] = Math.round(paymentBreakdown[k] * 100) / 100;
    });

    const revenueTrend = Array.from(trendMap.values()).map(t => ({
      ...t,
      revenue: Math.round(t.revenue * 100) / 100
    }));

    return NextResponse.json({
      success: true,
      summary: {
        revenue: Math.round(revenue * 100) / 100,
        netSales: Math.round(netSales * 100) / 100,
        aov: Math.round(aov * 100) / 100,
        itemsSold,
        orderCount,
        dineInRevenue: Math.round(dineInRevenue * 100) / 100,
        takeawayRevenue: Math.round(takeawayRevenue * 100) / 100,
        gst: Math.round(gst * 100) / 100,
        sc: Math.round(sc * 100) / 100,
        trend,
        prevRevenue: Math.round(prevRevenue * 100) / 100,
        topItems,
        paymentBreakdown,
        revenueTrend
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
