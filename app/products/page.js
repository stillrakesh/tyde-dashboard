'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Layers } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/dashboard/products');
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Product Performance Leaderboard</h2>
          <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Most popular items ranked by quantity sold and revenue</p>
        </div>

        {products.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Rank</th>
                  <th style={{ padding: '12px' }}>Item Name</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Qty Sold</th>
                  <th style={{ padding: '12px' }}>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr key={p.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 12px', fontWeight: '900', color: idx < 3 ? '#94161c' : '#64748b' }}>#{idx + 1}</td>
                    <td style={{ padding: '16px 12px', fontWeight: '800', color: '#0f172a' }}>{p.name}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '8px', background: '#f1f5f9', fontWeight: '700', fontSize: '12px', color: '#475569' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: '800', color: '#2563eb' }}>{p.quantity} sold</td>
                    <td style={{ padding: '16px 12px', fontWeight: '900', color: '#94161c' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No product sales data synced yet. <br />
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Settle orders on your POS to generate itemized sales reports.</span>
          </div>
        )}
      </div>
    </div>
  );
}
