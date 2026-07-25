import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(req) {
  try {
    const account = await authenticate(req);

    if (!account) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'API key is required or invalid' },
        { status: 401 }
      );
    }

    const body = await req.json();
    let events = [];
    if (Array.isArray(body.events)) {
      events = body.events;
    } else if (body.type && body.payload) {
      events = [body];
    }

    let syncedCount = 0;

    for (const evt of events) {
      const type = evt.type;
      const payload = evt.payload || {};

      const grandTotal = Number(payload.grandTotal ?? payload.grand_total ?? payload.amount ?? payload.total ?? 0);

      if ((type === 'order_settled' || type === 'payment_done') && grandTotal > 0) {
        const localId = BigInt(payload.localOrderId ?? payload.local_order_id ?? payload.id ?? Date.now());
        const tableNum = String(payload.tableNumber ?? payload.table_number ?? payload.table_id ?? 'Virtual');
        const paymentMethod = String(payload.paymentMethod ?? payload.payment_mode ?? payload.payment_method ?? 'Cash');
        const status = String(payload.status ?? 'settled');
        const items = typeof payload.items === 'string' ? payload.items : JSON.stringify(payload.items || []);
        const custName = payload.customerName ?? payload.customer_name ?? null;
        const custPhone = payload.customerPhone ?? payload.customer_phone ?? payload.phone ?? null;
        const createdAt = payload.created_at ?? payload.createdAt ? new Date(payload.created_at || payload.createdAt) : new Date();

        const gstEnabled = Boolean(payload.gstEnabled ?? payload.gst_enabled);
        const gstRate = Number(payload.gstRate ?? payload.gst_rate ?? 0);
        const gstAmount = Number(payload.gstAmount ?? payload.gst_amount ?? 0);

        const serviceChargeEnabled = Boolean(payload.serviceChargeEnabled ?? payload.service_charge_enabled);
        const serviceChargeRate = Number(payload.serviceChargeRate ?? payload.service_charge_rate ?? 0);
        const serviceChargeAmount = Number(payload.serviceChargeAmount ?? payload.service_charge_amount ?? 0);

        const discountAmount = Number(payload.discountAmount ?? payload.discount_amount ?? 0);
        const tipAmount = Number(payload.tipAmount ?? payload.tip_amount ?? 0);
        const covers = Number(payload.covers ?? 1);

        await prisma.syncedOrder.upsert({
          where: {
            accountId_localOrderId: {
              accountId: account.id,
              localOrderId: localId
            }
          },
          update: {
            tableNumber: tableNum,
            items,
            grandTotal,
            paymentMethod,
            status,
            customerName: custName,
            customerPhone: custPhone,
            gstEnabled,
            gstRate,
            gstAmount,
            serviceChargeEnabled,
            serviceChargeRate,
            serviceChargeAmount,
            discountAmount,
            tipAmount,
            covers,
            created_at: createdAt,
            syncedAt: new Date()
          },
          create: {
            accountId: account.id,
            localOrderId: localId,
            tableNumber: tableNum,
            items,
            grandTotal,
            paymentMethod,
            status,
            customerName: custName,
            customerPhone: custPhone,
            gstEnabled,
            gstRate,
            gstAmount,
            serviceChargeEnabled,
            serviceChargeRate,
            serviceChargeAmount,
            discountAmount,
            tipAmount,
            covers,
            created_at: createdAt
          }
        });
        syncedCount++;
      } else if (type === 'customer_updated') {
        const phone = String(payload.phone || '').trim();
        const name = String(payload.name || payload.customerName || 'Guest').trim();

        if (phone && phone.length >= 7) {
          const visits = payload.visits !== undefined ? Number(payload.visits) : undefined;
          const totalSpent = payload.totalSpent !== undefined
            ? Number(payload.totalSpent)
            : (payload.amount_spent !== undefined ? Number(payload.amount_spent) : undefined);
          const loyaltyPts = payload.loyaltyPts !== undefined
            ? Number(payload.loyaltyPts)
            : (payload.loyalty_pts !== undefined ? Number(payload.loyalty_pts) : (payload.loyaltyPoints !== undefined ? Number(payload.loyaltyPoints) : undefined));

          const lastVisitDate = payload.lastVisit || payload.last_visit ? new Date(payload.lastVisit || payload.last_visit) : new Date();

          const existing = await prisma.syncedCustomer.findUnique({
            where: { accountId_phone: { accountId: account.id, phone } }
          });

          if (existing) {
            await prisma.syncedCustomer.update({
              where: { id: existing.id },
              data: {
                name: name || existing.name,
                visits: visits !== undefined ? visits : existing.visits + 1,
                totalSpent: totalSpent !== undefined ? totalSpent : existing.totalSpent,
                loyaltyPts: loyaltyPts !== undefined ? loyaltyPts : existing.loyaltyPts,
                lastVisit: lastVisitDate,
                syncedAt: new Date()
              }
            });
          } else {
            await prisma.syncedCustomer.create({
              data: {
                accountId: account.id,
                name: name || 'Guest',
                phone,
                visits: visits !== undefined ? visits : 1,
                totalSpent: totalSpent !== undefined ? totalSpent : 0,
                loyaltyPts: loyaltyPts !== undefined ? loyaltyPts : 0,
                lastVisit: lastVisitDate
              }
            });
          }
          syncedCount++;
        }
      } else if (type === 'expense_created') {
        await prisma.syncedExpense.create({
          data: {
            accountId: account.id,
            amount: Number(payload.amount || 0),
            category: String(payload.category || 'General'),
            note: payload.note ? String(payload.note) : null,
            expenseDate: payload.expenseDate || payload.expense_date ? new Date(payload.expenseDate || payload.expense_date) : new Date()
          }
        });
        syncedCount++;
      }
    }

    if (events.length > 0) {
      await prisma.syncLog.create({
        data: {
          accountId: account.id,
          eventType: events.map(e => e.type).join(','),
          itemCount: events.length
        }
      });
    }

    return NextResponse.json({ success: true, syncedCount });
  } catch (err) {
    console.error('API /sync/ingest error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
