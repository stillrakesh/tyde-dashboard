'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Award, Calendar, DollarSign } from 'lucide-react';

export default function CRMPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/dashboard/customers');
        const data = await res.json();
        if (data.success) setCustomers(data.customers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Customer CRM & Loyalty Database</h2>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Track visit count, lifetime spend, and loyalty points across all customers</p>
          </div>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input
              type="text"
              placeholder="Search name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '600', outline: 'none', background: '#f8fafc' }}
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Phone</th>
                  <th style={{ padding: '12px' }}>Visits</th>
                  <th style={{ padding: '12px' }}>Total Spent</th>
                  <th style={{ padding: '12px' }}>Loyalty Pts</th>
                  <th style={{ padding: '12px' }}>Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#fff1f2', color: '#94161c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px' }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        {c.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', color: '#475569', fontWeight: '600' }}>{c.phone}</td>
                    <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>{c.visits} visits</td>
                    <td style={{ padding: '16px 12px', fontWeight: '900', color: '#16a34a' }}>₹{c.totalSpent.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', fontWeight: '800', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Award size={13} /> {c.loyaltyPts} pts
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', color: '#64748b', fontSize: '12px' }}>
                      {c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No customer records found. <br />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Customer profiles automatically sync from local POS order settlements.</span>
          </div>
        )}
      </div>
    </div>
  );
}
