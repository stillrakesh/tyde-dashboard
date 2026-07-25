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

    const expenses = await prisma.syncedExpense.findMany({
      where: {
        accountId: account.id,
        expenseDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        expenseDate: 'desc'
      }
    });

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

    const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const categoryBreakdown = {};
    for (const exp of expenses) {
      const cat = exp.category || 'General';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (exp.amount || 0);
    }

    // Round category breakdown amounts
    Object.keys(categoryBreakdown).forEach(cat => {
      categoryBreakdown[cat] = Math.round(categoryBreakdown[cat] * 100) / 100;
    });

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      expenses: expenses.map(exp => ({
        ...exp,
        amount: Math.round(exp.amount * 100) / 100
      })),
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netProfit: Math.round(netProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        categoryBreakdown
      }
    });
  } catch (err) {
    console.error('API /dashboard/expenses GET error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const account = await authenticate(req);
    if (!account) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, category, note, expenseDate } = body || {};

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Valid positive expense amount is required' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Category is required' },
        { status: 400 }
      );
    }

    const expense = await prisma.syncedExpense.create({
      data: {
        accountId: account.id,
        amount: Number(amount),
        category: category.trim(),
        note: note ? String(note).trim() : null,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date()
      }
    });

    return NextResponse.json({
      success: true,
      expense: {
        ...expense,
        amount: Math.round(expense.amount * 100) / 100
      }
    });
  } catch (err) {
    console.error('API /dashboard/expenses POST error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err.message },
      { status: 500 }
    );
  }
}
