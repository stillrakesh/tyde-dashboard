'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, CreditCard, DollarSign, PieChart, RefreshCw } from 'lucide-react';

export default function SalesPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await fetch('/api/dashboard/summary');
        const data = await res.json();
        if (data.success) setSummary(data.summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSales();
  }, []);

  const totalRev = summary?.totalRevenue || 0;
  const totalGst = summary?.totalGst || 0;
  const totalSC = summary?.totalServiceCharge || 0;
  const paymentBreakdown = summary?.paymentBreakdown || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Sales & Revenue Summary</h2>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Comprehensive financial performance pushed from local POS</p>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} /> All-Time Synced
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '20px', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#94161c', textTransform: 'uppercase' }}>GROSS REVENUE</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#94161c', marginTop: '8px' }}>₹{totalRev.toLocaleString('en-IN')}</div>
          </div>

          <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>GST COLLECTED</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '8px' }}>₹{totalGst.toLocaleString('en-IN')}</div>
          </div>

          <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>SERVICE CHARGE</div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#2563eb', marginTop: '8px' }}>₹{totalSC.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Payment Mode Breakdown</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {Object.entries(paymentBreakdown).map(([method, amount]) => (
            <div key={method} style={{ padding: '20px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>{method}</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>₹{amount.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ padding: '10px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <CreditCard size={20} color="#94161c" />
              </div>
            </div>
          ))}
          {Object.keys(paymentBreakdown).length === 0 && (
            <div style={{ padding: '24px', color: '#94a3b8', fontSize: '13px', fontWeight: '600', textAlign: 'center', gridColumn: '1 / -1' }}>
              No payment breakdown data synced yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
