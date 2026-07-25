'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Calendar, RefreshCw, Radio } from 'lucide-react';

const TITLES = {
  '/': 'Cloud Dashboard Overview',
  '/sales': 'Sales & Revenue Analytics',
  '/products': 'Product Performance Leaderboard',
  '/crm': 'Customer CRM & Loyalty Database',
  '/orders': 'Synced Order History',
  '/expenses': 'Expenses & Profit & Loss Statement',
  '/settings': 'Cloud API & POS Connection Setup',
};

export default function Header() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const title = TITLES[pathname] || 'Cloud Dashboard';

  return (
    <header style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>{title}</h1>
        <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Real-time remote restaurant intelligence</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <Radio size={14} color="#16a34a" className="pulse-icon" />
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>LIVE SYNC</span>
        </div>

        {/* Store Selector */}
        <div style={{ padding: '8px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
          🏬 TYDE Cafe (Main Branch)
        </div>
      </div>
    </header>
  );
}
