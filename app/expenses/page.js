'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Calendar, TrendingDown, TrendingUp } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Staff');
  const [note, setNote] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [expRes, sumRes] = await Promise.all([
          fetch('/api/dashboard/expenses'),
          fetch('/api/dashboard/summary')
        ]);
        const expData = await expRes.json();
        const sumData = await sumRes.json();
        if (expData.success) {
          setExpenses(expData.expenses);
          setTotalExpenses(expData.totalExpenses);
        }
        if (sumData.success) {
          setRevenue(sumData.summary.totalRevenue || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount) return;
    try {
      const res = await fetch('/api/dashboard/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, category, note })
      });
      const data = await res.json();
      if (data.success) {
        setExpenses(prev => [data.expense, ...prev]);
        setTotalExpenses(prev => prev + Number(amount));
        setAmount('');
        setNote('');
        setShowAdd(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const netProfit = revenue - totalExpenses;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* P&L Header Snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '8px' }}>₹{revenue.toLocaleString('en-IN')}</div>
        </div>

        <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL EXPENSES</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>₹{totalExpenses.toLocaleString('en-IN')}</div>
        </div>

        <div style={{ padding: '24px', background: netProfit >= 0 ? '#f0fdf4' : '#fef2f2', borderRadius: '20px', border: `1px solid ${netProfit >= 0 ? '#bbf7d0' : '#fecdd3'}` }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: netProfit >= 0 ? '#16a34a' : '#dc2626', textTransform: 'uppercase' }}>NET PROFIT / LOSS</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: netProfit >= 0 ? '#16a34a' : '#dc2626', marginTop: '8px' }}>₹{netProfit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Expenses Log */}
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Expense Log</h2>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Operational expenditure and supplier costs</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary">
            <Plus size={16} /> Log Expense
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAddExpense} style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input type="number" placeholder="Amount (₹)" value={amount} onChange={e => setAmount(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none' }} required />
            <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none' }}>
              <option>Staff</option>
              <option>Rent & Utilities</option>
              <option>Supplies & Raw Materials</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
            <input type="text" placeholder="Note / Details" value={note} onChange={e => setNote(e.target.value)} style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '600', outline: 'none' }} />
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Save</button>
          </form>
        )}

        {expenses.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Note</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>{e.category}</td>
                    <td style={{ padding: '16px 12px', color: '#475569' }}>{e.note || '—'}</td>
                    <td style={{ padding: '16px 12px', fontWeight: '900', color: '#dc2626' }}>₹{e.amount}</td>
                    <td style={{ padding: '16px 12px', color: '#64748b', fontSize: '12px' }}>{new Date(e.expenseDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No expenses logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
