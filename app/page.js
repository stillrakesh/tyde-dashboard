'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Cloud,
  Receipt,
  Utensils,
  Truck,
  Percent,
  DollarSign,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import DateRangeHeader, { getPresetDates } from '@/components/DateRangeHeader';
import SubTabNav from '@/components/SubTabNav';

export default function OverviewPage() {
  const initialDates = getPresetDates('30days');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [presetKey, setPresetKey] = useState('30days');

  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (f = fromDate, t = toDate) => {
    setLoading(true);
    try {
      const [sumRes, ordRes] = await Promise.all([
        fetch(`/api/dashboard/summary?from=${f}&to=${t}`),
        fetch(`/api/dashboard/orders?from=${f}&to=${t}&limit=6`)
      ]);
      const sumData = await sumRes.json();
      const ordData = await ordRes.json();

      if (sumData.success) setSummary(sumData.summary);
      if (ordData.success) setRecentOrders(ordData.orders);
    } catch (err) {
      console.error('Fetch dashboard overview error:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData(fromDate, toDate);

    // 30-second continuous auto-refresh polling
    const interval = setInterval(() => {
      fetchData(fromDate, toDate);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData, fromDate, toDate]);

  const handleRangeChange = (newFrom, newTo, key) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setPresetKey(key);
  };

  const totalRev = summary?.revenue || 0;
  const netSales = summary?.netSales || 0;
  const aov = summary?.aov || 0;
  const itemsSold = summary?.itemsSold || 0;
  const orderCount = summary?.orderCount || 0;
  const dineInRevenue = summary?.dineInRevenue || 0;
  const takeawayRevenue = summary?.takeawayRevenue || 0;
  const gst = summary?.gst || 0;
  const sc = summary?.sc || 0;
  const trendVal = summary?.trend ?? 0;

  const topItems = summary?.topItems || [];
  const revenueTrend = summary?.revenueTrend || [];

  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SubTabNav />
        <DateRangeHeader
          activePreset={presetKey}
          fromDate={fromDate}
          toDate={toDate}
          onRangeChange={handleRangeChange}
          onRefresh={() => fetchData(fromDate, toDate)}
        />
        <div style={{ padding: '80px', textAlign: 'center', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #fecdd3', borderTopColor: '#94161c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginTop: '16px' }}>Fetching Live Cloud POS Analytics...</h3>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

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
        onRefresh={() => fetchData(fromDate, toDate)}
      />

      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '24px 32px',
          borderRadius: '20px',
          color: 'white',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)'
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'rgba(148, 22, 28, 0.4)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              fontSize: '11px',
              fontWeight: '800',
              color: '#fecaca',
              marginBottom: '10px'
            }}
          >
            <Cloud size={14} color="#f87171" /> LIVE POS STREAMING
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.3px' }}>
            Cloud Executive Overview
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', fontWeight: '500' }}>
            Real-time analytics aggregated across all POS register terminals.
          </p>
        </div>

        <Link href="/sales" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Sparkles size={16} /> Deep Analytics
        </Link>
      </div>

      {/* 9 KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* 1. TOTAL REVENUE */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              TOTAL REVENUE
            </span>
            <div style={{ padding: '8px', background: '#fff1f2', borderRadius: '10px' }}>
              <TrendingUp size={18} color="#94161c" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{totalRev.toLocaleString('en-IN')}
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '700',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: trendVal >= 0 ? '#16a34a' : '#dc2626'
            }}
          >
            {trendVal >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trendVal >= 0 ? `+${trendVal}%` : `${trendVal}%`} vs prev period</span>
          </div>
        </div>

        {/* 2. NET SALES */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              NET SALES
            </span>
            <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '10px' }}>
              <DollarSign size={18} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{netSales.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Excluding GST & SC
          </div>
        </div>

        {/* 3. AVG ORDER VALUE */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              AVG ORDER VALUE
            </span>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px' }}>
              <CreditCard size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{aov.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Per ticket average
          </div>
        </div>

        {/* 4. ITEMS SOLD */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              ITEMS SOLD
            </span>
            <div style={{ padding: '8px', background: '#faf5ff', borderRadius: '10px' }}>
              <Clock size={18} color="#9333ea" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            {itemsSold.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Dishes & beverages
          </div>
        </div>

        {/* 5. TOTAL ORDERS */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              TOTAL ORDERS
            </span>
            <div style={{ padding: '8px', background: '#fff7ed', borderRadius: '10px' }}>
              <ShoppingBag size={18} color="#ea580c" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            {orderCount.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Completed tickets
          </div>
        </div>

        {/* 6. DINE-IN REVENUE */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              DINE-IN REVENUE
            </span>
            <div style={{ padding: '8px', background: '#ecfeff', borderRadius: '10px' }}>
              <Utensils size={18} color="#0891b2" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{dineInRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            In-restaurant dining
          </div>
        </div>

        {/* 7. PICKUP/TAKEAWAY */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              PICKUP / TAKEAWAY
            </span>
            <div style={{ padding: '8px', background: '#fdf4ff', borderRadius: '10px' }}>
              <Truck size={18} color="#c026d3" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{takeawayRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Takeaway & delivery
          </div>
        </div>

        {/* 8. GST COLLECTED */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              GST COLLECTED
            </span>
            <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '10px' }}>
              <Percent size={18} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{gst.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Tax collected
          </div>
        </div>

        {/* 9. SERVICE CHARGE */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              SERVICE CHARGE
            </span>
            <div style={{ padding: '8px', background: '#fff1f2', borderRadius: '10px' }}>
              <Receipt size={18} color="#94161c" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '10px' }}>
            ₹{sc.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px' }}>
            Service fees
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart & Top Items Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Revenue Trend Area Chart */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Revenue Trend</h3>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                Daily sales performance over selected period
              </p>
            </div>
          </div>

          {revenueTrend.length > 0 ? (
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94161c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#94161c" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#94161c" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
              No revenue trend data available for this range.
            </div>
          )}
        </div>

        {/* Top Selling Items */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Top Items</h3>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Highest grossing products</p>
            </div>
            <Link href="/products" style={{ fontSize: '12px', fontWeight: '800', color: '#94161c', textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {topItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topItems.slice(0, 5).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: '800', color: '#1e293b' }}>{item.name}</span>
                    <span style={{ fontWeight: '900', color: '#94161c' }}>₹{item.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                    <span>{item.quantity} units sold</span>
                    <span>{item.contribution}% share</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, item.contribution * 3)}%`, background: '#94161c', borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No item data synced yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Recent Synced Orders</h3>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
              Latest transactions synced from POS
            </p>
          </div>
          <Link href="/orders" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All Orders <ArrowRight size={16} />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Type / Table</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Payment</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0f172a' }}>#{o.localOrderId}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '700' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: o.orderType === 'Takeaway' ? '#fdf4ff' : o.orderType === 'Delivery' ? '#fff7ed' : '#eff6ff',
                          color: o.orderType === 'Takeaway' ? '#c026d3' : o.orderType === 'Delivery' ? '#c2410c' : '#1d4ed8',
                          fontWeight: '800',
                          fontSize: '11px'
                        }}
                      >
                        {o.orderType} ({o.tableNumber})
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569', fontWeight: '600' }}>
                      {o.customerName || 'Walk-In Customer'}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', fontWeight: '700', fontSize: '11px', color: '#334155' }}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '900', color: '#94161c' }}>
                      ₹{o.grandTotal}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: o.status.toLowerCase().includes('cancel') ? '#fef2f2' : '#f0fdf4',
                          color: o.status.toLowerCase().includes('cancel') ? '#dc2626' : '#16a34a',
                          fontWeight: '800',
                          fontSize: '11px'
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '12px' }}>
                      {new Date(o.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px', fontWeight: '600', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No orders found for the selected period.
          </div>
        )}
      </div>
    </div>
  );
}
