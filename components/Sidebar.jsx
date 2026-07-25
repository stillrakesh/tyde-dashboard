'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, TrendingUp, ShoppingBag, Users, Receipt, DollarSign, Key, Store, Cloud, CheckCircle2, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/sales', label: 'Sales Analytics', icon: TrendingUp },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/crm', label: 'Customer CRM', icon: Users },
  { href: '/orders', label: 'Order History', icon: Receipt },
  { href: '/expenses', label: 'Expenses & P&L', icon: DollarSign },
  { href: '/settings', label: 'API & Settings', icon: Key },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('tyde_cloud_account');
    document.cookie = 'tyde_cloud_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  if (pathname === '/login') return null;

  return (
    <aside style={{ width: '260px', background: 'linear-gradient(180deg, #131a28 0%, #0f172a 100%)', height: '100vh', position: 'sticky', top: 0, color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ background: 'linear-gradient(135deg, #94161c 0%, #f97316 100%)', color: 'white', padding: '10px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(148, 22, 28, 0.3)' }}>
          <Store size={20} />
        </div>
        <div>
          <div style={{ fontWeight: '900', fontSize: '16px', letterSpacing: '-0.3px' }}>TYDE CLOUD</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>Live Restaurant Dashboard</div>
        </div>
      </div>

      {/* Sync Status Badge */}
      <div style={{ margin: '16px 16px 8px', padding: '12px 14px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Cloud size={16} color="#10b981" />
        <div>
          <div style={{ fontSize: '11px', fontWeight: '900', color: '#34d399', textTransform: 'uppercase' }}>POS Sync Active</div>
          <div style={{ fontSize: '10px', color: '#a7f3d0', fontWeight: '600' }}>Receiving live POS data</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '12px 12px 24px', overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px', paddingLeft: '12px' }}>Analytics & Controls</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: isActive ? '800' : '600',
                  color: isActive ? '#fff' : '#cbd5e1',
                  background: isActive ? 'linear-gradient(135deg, rgba(148, 22, 28, 0.4), rgba(249, 115, 22, 0.15))' : 'transparent',
                  border: isActive ? '1px solid rgba(249, 115, 22, 0.28)' : '1px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.75, color: isActive ? '#f97316' : 'inherit' }} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#94161c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900' }}>T</div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '800' }}>TYDE Cafe</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Owner Account</div>
          </div>
        </div>
        <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', padding: '6px' }}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
