'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Percent,
  Receipt,
  PieChart as PieIcon,
  X,
  Plus
} from 'lucide-react';

import DateRangeHeader, { getPresetDates } from '@/components/DateRangeHeader';
import SubTabNav from '@/components/SubTabNav';

const EXPENSE_CATEGORIES = [
  'Raw Ingredients & Groceries',
  'Staff Salary & Wages',
  'Utilities & Electricity',
  'Rent & Lease',
  'Marketing & Ads',
  'Maintenance & Repairs',
  'Software & Subscriptions',
  'Miscellaneous'
];

export default function ExpensesPage() {
  const initialDates = getPresetDates('30days');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [presetKey, setPresetKey] = useState('30days');

  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    categoryBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  // Modal for logging new expense
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = useCallback(async (f = fromDate, t = toDate) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/expenses?from=${f}&to=${t}`);
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchExpenses(fromDate, toDate);
  }, [fetchExpenses, fromDate, toDate]);

  const handleRangeChange = (newFrom, newTo, key) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setPresetKey(key);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          category,
          note,
          expenseDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setAmount('');
        setNote('');
        fetchExpenses(fromDate, toDate);
      }
    } catch (err) {
      console.error('Submit expense error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const isProfitable = summary.netProfit >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SubTab Navigation */}
      <SubTabNav />

      {/* Date Range Header */}
      <DateRangeHeader
        activePreset={presetKey}
        fromDate={fromDate}
        toDate={toDate}
        onRangeChange={handleRangeChange}
        onRefresh={() => fetchExpenses(fromDate, toDate)}
      />

      {/* Financial P&L Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Total Revenue */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              TOTAL REVENUE
            </span>
            <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '10px' }}>
              <TrendingUp size={18} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Income from sales
          </div>
        </div>

        {/* Total Expenses */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              TOTAL EXPENSES
            </span>
            <div style={{ padding: '8px', background: '#fff1f2', borderRadius: '10px' }}>
              <TrendingDown size={18} color="#94161c" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#94161c', marginTop: '8px' }}>
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Operational outgoings
          </div>
        </div>

        {/* Net Profit */}
        <div className="kpi-card" style={{ background: isProfitable ? '#f0fdf4' : '#fff1f2', border: `1px solid ${isProfitable ? '#bbf7d0' : '#fecdd3'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: isProfitable ? '#16a34a' : '#94161c', textTransform: 'uppercase' }}>
              NET PROFIT / LOSS
            </span>
            <div style={{ padding: '8px', background: 'white', borderRadius: '10px' }}>
              <DollarSign size={18} color={isProfitable ? '#16a34a' : '#94161c'} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: isProfitable ? '#16a34a' : '#94161c', marginTop: '8px' }}>
            ₹{summary.netProfit.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: isProfitable ? '#15803d' : '#be123c', marginTop: '4px' }}>
            {isProfitable ? 'Net Positive Margin' : 'Net Deficit'}
          </div>
        </div>

        {/* Profit Margin % */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              PROFIT MARGIN
            </span>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px' }}>
              <Percent size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {summary.profitMargin}%
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Net profit to revenue ratio
          </div>
        </div>
      </div>

      {/* Category Breakdown & Action Button */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Expense Log Table */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Expense Logs</h3>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Recorded business expenses for the period
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              <Plus size={16} /> Log New Expense
            </button>
          </div>

          {expenses.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Note / Memo</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#fff1f2', color: '#94161c', fontWeight: '800', fontSize: '11px' }}>
                          {exp.category}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: '#475569', fontWeight: '600' }}>
                        {exp.note || '—'}
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: '900', color: '#0f172a' }}>
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '12px' }}>
                        {new Date(exp.expenseDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
              No expenses recorded for this period. Click "Log New Expense" to add one!
            </div>
          )}
        </div>

        {/* Category Breakdown Card */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>
            Category Distribution
          </h3>

          {Object.keys(summary.categoryBreakdown).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(summary.categoryBreakdown).map(([cat, amt]) => {
                const share = summary.totalExpenses > 0 ? Math.round((amt / summary.totalExpenses) * 100) : 0;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ fontWeight: '800', color: '#334155' }}>{cat}</span>
                      <span style={{ fontWeight: '900', color: '#94161c' }}>₹{amt.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${share}%`, background: '#94161c', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No expense breakdown available.
            </div>
          )}
        </div>
      </div>

      {/* Log Expense Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 100
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'white',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Log Business Expense</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: '700',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '700',
                    background: 'white',
                    outline: 'none'
                  }}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Note / Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purchased dairy & fresh vegetables"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                  Expense Date
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
