'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Utensils,
  Truck,
  CreditCard,
  User,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import DateRangeHeader, { getPresetDates } from '@/components/DateRangeHeader';
import SubTabNav from '@/components/SubTabNav';

export default function OrdersPage() {
  const initialDates = getPresetDates('30days');
  const [fromDate, setFromDate] = useState(initialDates.from);
  const [toDate, setToDate] = useState(initialDates.to);
  const [presetKey, setPresetKey] = useState('30days');

  const [search, setSearch] = useState('');
  const [orderType, setOrderType] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Selected Order for Modal / Drawer
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async (f = fromDate, t = toDate, p = page, s = search, ot = orderType, pm = paymentMethod, st = status) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: f,
        to: t,
        page: p.toString(),
        limit: '20'
      });
      if (s) params.append('search', s);
      if (ot !== 'all') params.append('orderType', ot);
      if (pm !== 'all') params.append('paymentMethod', pm);
      if (st !== 'all') params.append('status', st);

      const res = await fetch(`/api/dashboard/orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, page, search, orderType, paymentMethod, status]);

  useEffect(() => {
    fetchOrders(fromDate, toDate, page, search, orderType, paymentMethod, status);
  }, [fetchOrders, fromDate, toDate, page, search, orderType, paymentMethod, status]);

  const handleRangeChange = (newFrom, newTo, key) => {
    setFromDate(newFrom);
    setToDate(newTo);
    setPresetKey(key);
    setPage(1);
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = ['Order ID', 'Type', 'Table', 'Customer Name', 'Phone', 'Payment Method', 'Items Count', 'GST', 'Service Charge', 'Grand Total', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.localOrderId,
      o.orderType,
      o.tableNumber,
      `"${o.customerName || 'Walk-In'}"`,
      `"${o.customerPhone || ''}"`,
      o.paymentMethod,
      Array.isArray(o.items) ? o.items.length : 0,
      o.gstAmount || 0,
      o.serviceChargeAmount || 0,
      o.grandTotal || 0,
      o.status,
      new Date(o.created_at).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tyde_orders_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        onRefresh={() => fetchOrders(fromDate, toDate, page, search, orderType, paymentMethod, status)}
      />

      {/* Control Bar: Search & Filters & Export */}
      <div
        style={{
          background: 'white',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justify: 'space-between',
          gap: '16px'
        }}
      >
        {/* Live Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Order #, Customer Name, Phone, Table..."
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

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Order Type Filter */}
          <select
            value={orderType}
            onChange={(e) => {
              setOrderType(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: '700',
              color: '#334155',
              background: '#f8fafc',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Channels</option>
            <option value="dine-in">Dine In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: '700',
              color: '#334155',
              background: '#f8fafc',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Payment Modes</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Split">Split</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              background: '#94161c',
              color: 'white',
              border: 'none',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(148, 22, 28, 0.25)'
            }}
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
            Synced Order Database ({pagination.total} Total)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            Showing Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>

        {orders.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px' }}>Order ID</th>
                  <th style={{ padding: '12px' }}>Channel / Table</th>
                  <th style={{ padding: '12px' }}>Customer</th>
                  <th style={{ padding: '12px' }}>Items</th>
                  <th style={{ padding: '12px' }}>Payment</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Date & Time</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 12px', fontWeight: '800', color: '#0f172a' }}>
                      #{o.localOrderId}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
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
                      <div>{o.customerName || 'Walk-In'}</div>
                      {o.customerPhone && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{o.customerPhone}</div>}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '700', color: '#334155' }}>
                      {Array.isArray(o.items) ? `${o.items.length} items` : '0 items'}
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
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(o);
                        }}
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
                        <Eye size={14} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
            No orders match the search & filter criteria.
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

      {/* Order Item Details Drawer / Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justify: 'flex-end',
            zIndex: 100
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'white',
              height: '100%',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '24px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                  Order #{selectedOrder.localOrderId}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Info Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '20px 0' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>CHANNEL / TABLE</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginTop: '2px' }}>
                  {selectedOrder.orderType} ({selectedOrder.tableNumber})
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>PAYMENT MODE</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#94161c', marginTop: '2px' }}>
                  {selectedOrder.paymentMethod}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>
                CUSTOMER DETAILS
              </div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                {selectedOrder.customerName || 'Walk-In Customer'}
              </div>
              {selectedOrder.customerPhone && (
                <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>
                  📞 {selectedOrder.customerPhone}
                </div>
              )}
            </div>

            {/* Items List */}
            <div style={{ flex: 1, marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: '12px' }}>
                ORDER ITEMS
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => {
                    const name = item.name || item.title || item.itemName || 'Item';
                    const qty = item.quantity ?? item.qty ?? item.count ?? 1;
                    const price = item.price ?? item.unitPrice ?? 0;
                    const itemTotal = item.total !== undefined ? item.total : (price * qty);

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justify: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          background: '#f8fafc',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {qty} x ₹{price}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>
                          ₹{itemTotal}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>No item details available.</div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>GST Tax</span>
                <span style={{ fontWeight: '700' }}>₹{selectedOrder.gstAmount || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>Service Charge</span>
                <span style={{ fontWeight: '700' }}>₹{selectedOrder.serviceChargeAmount || 0}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#dc2626' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: '700' }}>-₹{selectedOrder.discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', color: '#94161c', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span>GRAND TOTAL</span>
                <span>₹{selectedOrder.grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
