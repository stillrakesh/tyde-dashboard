'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Search,
  Trophy,
  BarChart2,
  TrendingUp,
  Filter,
  DollarSign,
  PackageCheck
} from 'lucide-react';

import DateRangeHeader, { getPresetDates } from '@/components/DateRangeHeader';
import SubTabNav from '@/components/SubTabNav';

export default function ProductsPage() {
  const initialDates = getPresetDates('30days');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [presetKey, setPresetKey] = useState('30days');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalUnits: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async (f = fromDate, t = toDate, s = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: f,
        to: t,
        limit: '100'
      });
      if (s) params.append('search', s);
      if (cat !== 'all') params.append('category', cat);

      const res = await fetch(`/api/dashboard/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setCategories(data.categories || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, search, selectedCategory]);

  useEffect(() => {
    fetchProducts(fromDate, toDate, search, selectedCategory);
  }, [fetchProducts, fromDate, toDate, search, selectedCategory]);

  const handleRangeChange = (newFrom, newTo, key) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setPresetKey(key);
  };

  const topProduct = products.length > 0 ? products[0] : null;

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
        onRefresh={() => fetchProducts(fromDate, toDate, search, selectedCategory)}
      />

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Top Product */}
        <div className="kpi-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94161c', textTransform: 'uppercase' }}>
              #1 TOP PERFORMER
            </span>
            <div style={{ padding: '8px', background: 'white', borderRadius: '10px' }}>
              <Trophy size={18} color="#94161c" />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {topProduct ? topProduct.name : 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#94161c', fontWeight: '700', marginTop: '4px' }}>
            {topProduct ? `₹${topProduct.revenue.toLocaleString('en-IN')} (${topProduct.unitsSold} units)` : 'No sales yet'}
          </div>
        </div>

        {/* Gross Product Revenue */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              PRODUCT REVENUE
            </span>
            <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '10px' }}>
              <DollarSign size={18} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Sum of menu items sold
          </div>
        </div>

        {/* Total Volume Sold */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              TOTAL UNITS SOLD
            </span>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px' }}>
              <PackageCheck size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {summary.totalUnits.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Individual dishes served
          </div>
        </div>

        {/* Unique Menu Items */}
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              UNIQUE MENU ITEMS
            </span>
            <div style={{ padding: '8px', background: '#faf5ff', borderRadius: '10px' }}>
              <ShoppingBag size={18} color="#9333ea" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {summary.totalProducts}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Active menu selections
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filter Pills */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Live Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search product name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                color: '#0f172a',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', marginRight: '4px' }}>
            Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: selectedCategory === 'all' ? '800' : '600',
              background: selectedCategory === 'all' ? '#94161c' : '#f1f5f9',
              color: selectedCategory === 'all' ? 'white' : '#475569',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat.toLowerCase())}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: isActive ? '800' : '600',
                  background: isActive ? '#94161c' : '#f1f5f9',
                  color: isActive ? 'white' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>
          Product Ranking Leaderboard
        </h3>

        {products.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px', width: '60px' }}>Rank</th>
                  <th style={{ padding: '12px' }}>Product Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Avg Unit Price</th>
                  <th style={{ padding: '12px' }}>Units Sold</th>
                  <th style={{ padding: '12px' }}>Total Revenue</th>
                  <th style={{ padding: '12px', width: '200px' }}>% Revenue Share</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.rank} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '900', color: p.rank <= 3 ? '#94161c' : '#64748b' }}>
                      #{p.rank}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0f172a' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '11px'
                        }}
                      >
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569', fontWeight: '700' }}>
                      ₹{p.unitPrice}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0f172a' }}>
                      {p.unitsSold}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '900', color: '#94161c' }}>
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#475569' }}>
                          <span>{p.contributionPercentage}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, p.contributionPercentage * 3)}%`,
                              background: '#94161c',
                              borderRadius: '3px'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
            No products match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
