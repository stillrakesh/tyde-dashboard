'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Receipt, TrendingUp, ShoppingBag, CreditCard, DollarSign, Users } from 'lucide-react';

const SUB_TABS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/orders', label: 'Orders', icon: Receipt },
  { href: '/sales', label: 'Sales Analytics', icon: TrendingUp, exact: true },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/sales?tab=payments', label: 'Payments', icon: CreditCard, isPayments: true },
  { href: '/expenses', label: 'Expenses', icon: DollarSign },
  { href: '/crm', label: 'CRM', icon: Users },
];

function SubTabNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '4px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        marginBottom: '20px'
      }}
    >
      {SUB_TABS.map((tab) => {
        let isActive = false;
        if (tab.isPayments) {
          isActive = pathname === '/sales' && tabParam === 'payments';
        } else if (tab.exact) {
          isActive = pathname === tab.href && tabParam !== 'payments';
        } else {
          isActive = pathname === tab.href;
        }

        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: isActive ? '800' : '600',
              color: isActive ? '#ffffff' : '#64748b',
              background: isActive
                ? 'linear-gradient(135deg, #94161c 0%, #b91c1c 100%)'
                : 'transparent',
              boxShadow: isActive ? '0 4px 12px rgba(148, 22, 28, 0.25)' : 'none',
              transition: 'all 0.15s ease-in-out',
              whiteSpace: 'nowrap',
              textDecoration: 'none'
            }}
          >
            <Icon size={16} color={isActive ? '#ffffff' : '#64748b'} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function SubTabNav() {
  return (
    <Suspense fallback={
      <div style={{ height: '48px', marginBottom: '20px', background: '#f8fafc', borderRadius: '16px' }} />
    }>
      <SubTabNavContent />
    </Suspense>
  );
}
