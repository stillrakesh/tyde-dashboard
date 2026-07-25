'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, CreditCard, Clock, Users, ArrowUpRight, Cloud, RefreshCw, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sumRes, ordRes] = await Promise.all([
          fetch('/api/dashboard/summary'),
          fetch('/api/dashboard/orders')
        ]);
        const sumData = await sumRes.json();
        const ordData = await ordRes.json();
        if (sumData.success) setSummary(sumData.summary);
        if (ordData.success) setRecentOrders(ordData.orders.slice(0, 5));
      } catch (err) {
        console.error('Fetch dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalRev = summary?.revenue || 0;
  const totalOrders = summary?.orderCount || 0;
  const avgOrder = summary?.aov || 0;
  const itemsSold = summary?.itemsSold || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '28px 32px', borderRadius: '24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(148, 22, 28, 0.4)', border: '1px solid rgba(249, 115, 22, 0.3)', fontSize: '11px', fontWeight: '800', color: '#fecaca', marginBottom: '12px' }}>
            <Cloud size={14} color="#f97316" /> LIVE CLOUD SYNCED
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>Welcome back, Owner!</h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>Your POS system is actively syncing live sales and customer data to this cloud console.</p>
        </div>
        <Link href="/settings" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Key size={16} /> Manage Cloud API Key
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL REVENUE</span>
            <div style={{ padding: '8px', background: '#fff1f2', borderRadius: '10px' }}>
              <TrendingUp size={20} color="#94161c" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '12px' }}>₹{totalRev.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '700', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> Live synced total
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>TOTAL ORDERS</span>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px' }}>
              <ShoppingBag size={20} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '12px' }}>{totalOrders}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Completed bills</div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>AVG ORDER VALUE</span>
            <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '10px' }}>
              <CreditCard size={20} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '12px' }}>₹{avgOrder}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Per transaction</div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>ITEMS SOLD</span>
            <div style={{ padding: '8px', background: '#faf5ff', borderRadius: '10px' }}>
              <Clock size={20} color="#9333ea" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', marginTop: '12px' }}>{itemsSold}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Dishes & drinks</div>
        </div>
      </div>

      {/* Recent Synced Orders Section */}
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Live Synced Orders</h3>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Recent transactions pushed from local POS</p>
          </div>
          <Link href="/orders" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Orders <ArrowRight size={16} />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Table / Channel</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Payment</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>#{o.localOrderId}</td>
                    <td style={{ padding: '16px 12px', fontWeight: '700' }}>Table {o.tableNumber}</td>
                    <td style={{ padding: '16px 12px', color: '#475569' }}>{o.customerName || 'Walk-In'}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', fontWeight: '700', fontSize: '12px', color: '#334155' }}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: '900', color: '#94161c' }}>₹{o.grandTotal}</td>
                    <td style={{ padding: '16px 12px', color: '#64748b', fontSize: '12px' }}>
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No synced orders yet. <br />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Settle an order on your local POS to see it sync live here in seconds!</span>
          </div>
        )}
      </div>
    </div>
  );
}
