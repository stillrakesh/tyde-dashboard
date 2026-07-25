'use client';

import React, { useState } from 'react';
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7days', label: 'Last 7 Days' },
  { key: '30days', label: 'Last 30 Days' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'custom', label: 'Custom' },
];

export function getPresetDates(preset) {
  const now = new Date();
  const formatDate = (d) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  };

  if (preset === 'today') {
    const today = formatDate(now);
    return { from: today, to: today };
  }
  if (preset === 'yesterday') {
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    const dStr = formatDate(yest);
    return { from: dStr, to: dStr };
  }
  if (preset === '7days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { from: formatDate(start), to: formatDate(now) };
  }
  if (preset === '30days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { from: formatDate(start), to: formatDate(now) };
  }
  if (preset === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: formatDate(start), to: formatDate(now) };
  }
  if (preset === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from: formatDate(start), to: formatDate(end) };
  }
  return { from: formatDate(now), to: formatDate(now) };
}

export default function DateRangeHeader({
  activePreset = '30days',
  fromDate = '',
  toDate = '',
  onRangeChange = () => {},
  onRefresh = () => {}
}) {
  const [preset, setPreset] = useState(activePreset);
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);

  const handleSelectPreset = (key) => {
    setPreset(key);
    if (key !== 'custom') {
      const dates = getPresetDates(key);
      setFrom(dates.from);
      setTo(dates.to);
      onRangeChange(dates.from, dates.to, key);
    }
  };

  const handleCustomApply = () => {
    if (from && to) {
      onRangeChange(from, to, 'custom');
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px 24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justify: 'space-between',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}
    >
      {/* Preset Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: '800', marginRight: '8px' }}>
          <Calendar size={16} color="#94161c" /> Range:
        </div>
        {PRESETS.map((p) => {
          const isActive = preset === p.key;
          return (
            <button
              key={p.key}
              onClick={() => handleSelectPreset(p.key)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: isActive ? '800' : '600',
                border: isActive ? '1px solid #94161c' : '1px solid #e2e8f0',
                background: isActive ? '#fff1f2' : '#f8fafc',
                color: isActive ? '#94161c' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out'
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Date Pickers & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPreset('custom');
              onRangeChange(e.target.value, to, 'custom');
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: '600',
              color: '#1e293b',
              background: '#ffffff',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPreset('custom');
              onRangeChange(from, e.target.value, 'custom');
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: '600',
              color: '#1e293b',
              background: '#ffffff',
              outline: 'none'
            }}
          />
        </div>

        <button
          onClick={onRefresh}
          title="Refresh Data"
          style={{
            padding: '8px 12px',
            borderRadius: '10px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#334155',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '700'
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
    </div>
  );
}
