'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, Search, Eye, X, CreditCard, User, Calendar } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/dashboard/orders');
        const data = await res.json();
        if (data.success) setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filtered = orders.filter(o =>
    String(o.localOrderId).includes(search) ||
    String(o.tableNumber).toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ background: 'white', padding: '28px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>Synced Order History</h2>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Complete receipt and item audit log pushed from POS</p>
          </div>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input
              type="text"
              placeholder="Search order ID, table, or customer..."
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
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Table</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Payment Mode</th>
                  <th style={{ padding: '12px' }}>Grand Total</th>
                  <th style={{ padding: '12px' }}>Date / Time</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
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
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button onClick={() => setSelectedOrder(o)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <Eye size={14} /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px', fontWeight: '600', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
            No orders found.
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Order #{selectedOrder.localOrderId}</h3>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Table {selectedOrder.tableNumber} • {new Date(selectedOrder.created_at).toLocaleString()}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600' }}>
                  <span>{item.qty || item.quantity || 1}x {item.name}</span>
                  <span style={{ fontWeight: '800' }}>₹{(item.qty || item.quantity || 1) * Number(item.price || 0)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: '#94161c' }}>
                <span>Grand Total</span>
                <span>₹{selectedOrder.grandTotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                <span>Payment Mode</span>
                <span>{selectedOrder.paymentMethod}</span>
              </div>
              {selectedOrder.customerName && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  <span>Customer</span>
                  <span>{selectedOrder.customerName} ({selectedOrder.customerPhone})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
