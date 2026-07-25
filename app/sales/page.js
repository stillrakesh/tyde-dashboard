'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Utensils,
  Truck,
  ArrowUpRight,
  DollarSign,
  Wallet,
  Smartphone,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import DateRangeHeader, { getPresetDates } from '@/components/DateRangeHeader';
import SubTabNav from '@/components/SubTabNav';

const COLORS = ['#94161c', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2'];

export default function SalesPage() {
  const initialDates = getPresetDates('30days');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [presetKey, setPresetKey] = useState('30days');

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async (f = fromDate, t = toDate) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/summary?from=${f}&to=${t}`);
      const data = await res.json();
      if (data.success) setSummary(data.summary);
    } catch (err) {
      console.error('Fetch sales error:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchSales(fromDate, toDate);
  }, [fetchSales, fromDate, toDate]);

  const handleRangeChange = (newFrom, newTo, key) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setPresetKey(key);
  };

  const totalRev = summary?.revenue || 0;
  const netSales = summary?.netSales || 0;
  const totalGst = summary?.gst || 0;
  const totalSC = summary?.sc || 0;
  const dineInRev = summary?.dineInRevenue || 0;
  const takeawayRev = summary?.takeawayRevenue || 0;
  const paymentBreakdown = summary?.paymentBreakdown || {};
  const revenueTrend = summary?.revenueTrend || [];

  // Format payment breakdown for Pie Chart
  const pieData = Object.entries(paymentBreakdown).map(([name, value]) => ({
    name,
    value: Number(value)
  })).filter(d => d.value > 0);

  // Format channel split data
  const channelData = [
    { name: 'Dine-In', value: dineInRev, color: '#0891b2' },
    { name: 'Takeaway / Delivery', value: takeawayRev, color: '#c026d3' }
  ].filter(d => d.value > 0);

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
        onRefresh={() => fetchSales(fromDate, toDate)}
      />

      {/* Top Financial Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="kpi-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#94161c', textTransform: 'uppercase' }}>
            GROSS REVENUE
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#94161c', marginTop: '8px' }}>
            ₹{totalRev.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#be123c', fontWeight: '600', marginTop: '4px' }}>
            Total billed value
          </div>
        </div>

        <div className="kpi-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>
            NET SALES
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#16a34a', marginTop: '8px' }}>
            ₹{netSales.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', marginTop: '4px' }}>
            Revenue minus Tax & SC
          </div>
        </div>

        <div className="kpi-card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>
            GST COLLECTED
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#2563eb', marginTop: '8px' }}>
            ₹{totalGst.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600', marginTop: '4px' }}>
            Output Tax liability
          </div>
        </div>

        <div className="kpi-card" style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>
            SERVICE CHARGE
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#ea580c', marginTop: '8px' }}>
            ₹{totalSC.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '600', marginTop: '4px' }}>
            Service Fee
          </div>
        </div>
      </div>

      {/* Hourly / Daily Trend Chart */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Sales Trend & Volume</h3>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              Revenue trajectory over the selected period
            </p>
          </div>
        </div>

        {revenueTrend.length > 0 ? (
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value.toLocaleString('en-IN')}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="revenue" fill="#94161c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
            No sales trend data available for this range.
          </div>
        )}
      </div>

      {/* Payment Modes & Sales Channels Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Payment Modes */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
            Payment Modes Breakdown
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '20px' }}>
            Distribution across Cash, UPI, Card & Split payments
          </p>

          {pieData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                      contentStyle={{ background: '#0f172a', borderRadius: '10px', color: '#fff', border: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Payment Mode Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {pieData.map((item, idx) => {
                  const share = totalRev > 0 ? Math.round((item.value / totalRev) * 100 * 10) / 10 : 0;
                  return (
                    <div
                      key={item.name}
                      style={{
                        padding: '14px',
                        borderRadius: '14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: COLORS[idx % COLORS.length]
                          }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>
                          {item.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                        ₹{item.value.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        {share}% share
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No payment breakdown data synced.
            </div>
          )}
        </div>

        {/* Sales Channels Breakdown */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '4px' }}>
            Sales Channel Split
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '20px' }}>
            Dine-In vs Pickup & Delivery Revenue
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: '#ecfeff',
                border: '1px solid #cff4fc',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '12px', background: '#0891b2', borderRadius: '12px', color: 'white' }}>
                  <Utensils size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#0e7490', textTransform: 'uppercase' }}>
                    Dine-In Revenue
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0e7490', marginTop: '2px' }}>
                    ₹{dineInRev.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#0e7490' }}>
                {totalRev > 0 ? Math.round((dineInRev / totalRev) * 100) : 0}%
              </div>
            </div>

            <div
              style={{
                padding: '20px',
                borderRadius: '16px',
                background: '#fdf4ff',
                border: '1px solid #fae8ff',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '12px', background: '#c026d3', borderRadius: '12px', color: 'white' }}>
                  <Truck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#a21caf', textTransform: 'uppercase' }}>
                    Takeaway & Delivery
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#a21caf', marginTop: '2px' }}>
                    ₹{takeawayRev.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#a21caf' }}>
                {totalRev > 0 ? Math.round((takeawayRev / totalRev) * 100) : 0}%
              </div>
            </div>

            {/* Visual Channel Share Bar */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                <span style={{ color: '#0e7490' }}>Dine-In ({totalRev > 0 ? Math.round((dineInRev / totalRev) * 100) : 0}%)</span>
                <span style={{ color: '#a21caf' }}>Takeaway/Delivery ({totalRev > 0 ? Math.round((takeawayRev / totalRev) * 100) : 0}%)</span>
              </div>
              <div style={{ height: '12px', width: '100%', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', width: `${totalRev > 0 ? (dineInRev / totalRev) * 100 : 50}%`, background: '#0891b2' }} />
                <div style={{ height: '100%', width: `${totalRev > 0 ? (takeawayRev / totalRev) * 100 : 50}%`, background: '#c026d3' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
