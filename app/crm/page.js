'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Phone,
  Crown,
  TrendingUp,
  CreditCard,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Award
} from 'lucide-react';

import SubTabNav from '@/components/SubTabNav';

export default function CRMPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({ totalCustomers: 0, totalCustomerSpend: 0, averageCustomerValue: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(async (p = page, s = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: '25'
      });
      if (s) params.append('search', s);

      const res = await fetch(`/api/dashboard/customers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        if (data.summary) setSummary(data.summary);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Fetch CRM customers error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers(page, search);
  }, [fetchCustomers, page, search]);

  const vipCount = customers.filter(c => c.totalSpent >= 2000).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SubTab Navigation */}
      <SubTabNav />

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              TOTAL CRM CUSTOMERS
            </span>
            <div style={{ padding: '8px', background: '#eff6ff', borderRadius: '10px' }}>
              <Users size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            {summary.totalCustomers.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Registered guest profiles
          </div>
        </div>

        <div className="kpi-card" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94161c', textTransform: 'uppercase' }}>
              TOTAL CUSTOMER SPEND
            </span>
            <div style={{ padding: '8px', background: 'white', borderRadius: '10px' }}>
              <TrendingUp size={18} color="#94161c" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#94161c', marginTop: '8px' }}>
            ₹{summary.totalCustomerSpend.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '12px', color: '#be123c', fontWeight: '600', marginTop: '4px' }}>
            Lifetime recorded revenue
          </div>
        </div>

        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
              AVG CUSTOMER VALUE
            </span>
            <div style={{ padding: '8px', background: '#f0fdf4', borderRadius: '10px' }}>
              <CreditCard size={18} color="#16a34a" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
            ₹{summary.averageCustomerValue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>
            Average spend per guest
          </div>
        </div>

        <div className="kpi-card" style={{ background: '#fff7ed', border: '1px solid #ffedd5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#ea580c', textTransform: 'uppercase' }}>
              VIP GUESTS
            </span>
            <div style={{ padding: '8px', background: 'white', borderRadius: '10px' }}>
              <Crown size={18} color="#ea580c" />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#ea580c', marginTop: '8px' }}>
            {vipCount}
          </div>
          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '600', marginTop: '4px' }}>
            High-value spenders
          </div>
        </div>
      </div>

      {/* Control Bar: Search */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by customer name or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
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

      {/* Customer List Table */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
            Customer CRM Directory ({pagination.total} Guests)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {customers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Phone</th>
                  <th style={{ padding: '12px' }}>Total Visits</th>
                  <th style={{ padding: '12px' }}>Total Spent</th>
                  <th style={{ padding: '12px' }}>Avg Spend / Visit</th>
                  <th style={{ padding: '12px' }}>Loyalty Pts</th>
                  <th style={{ padding: '12px' }}>Last Visit</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.totalSpent >= 2000 && <Crown size={14} color="#ea580c" title="VIP Customer" />}
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#475569', fontWeight: '600' }}>
                      {c.phone}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#334155' }}>
                      {c.visits} visits
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '900', color: '#94161c' }}>
                      ₹{c.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#16a34a' }}>
                      ₹{c.averageSpend}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#fff7ed', color: '#c2410c', fontWeight: '800', fontSize: '11px' }}>
                        {c.loyaltyPts || 0} pts
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#64748b', fontSize: '12px' }}>
                      {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontWeight: '700',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={14} /> Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
            No customer records found matching your search.
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: page <= 1 ? '#f8fafc' : '#ffffff',
                color: page <= 1 ? '#cbd5e1' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: page >= pagination.totalPages ? '#f8fafc' : '#ffffff',
                color: page >= pagination.totalPages ? '#cbd5e1' : '#334155',
                cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
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
          onClick={() => setSelectedCustomer(null)}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#94161c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '18px' }}>
                  {selectedCustomer.name ? selectedCustomer.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>{selectedCustomer.name}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>📞 {selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '14px', background: '#fff1f2', borderRadius: '14px', border: '1px solid #fecdd3' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94161c' }}>LIFETIME SPEND</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#94161c', marginTop: '2px' }}>₹{selectedCustomer.totalSpent}</div>
              </div>
              <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb' }}>TOTAL VISITS</div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', marginTop: '2px' }}>{selectedCustomer.visits} orders</div>
              </div>
            </div>

            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Average Spend / Visit:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>₹{selectedCustomer.averageSpend}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Loyalty Points Balance:</span>
                <span style={{ fontWeight: '800', color: '#ea580c' }}>{selectedCustomer.loyaltyPts || 0} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Last Recorded Visit:</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>{selectedCustomer.lastVisit ? new Date(selectedCustomer.lastVisit).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
