'use client';

import React, { useState } from 'react';
import { Key, Copy, Check, ShieldCheck, Terminal, Server } from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const sampleKey = 'tyde_live_98a7f10b2c3d4e5f6g7h';

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px' }}>
      {/* API Key Box */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ padding: '10px', background: '#fff1f2', borderRadius: '12px' }}>
            <Key size={20} color="#94161c" />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Cloud API Key</h2>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>Use this key in your local POS Settings → Connection Manager to authorize cloud sync</p>
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderRadius: '16px', background: '#0f172a', color: '#38bdf8', fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1e293b' }}>
          <span>{sampleKey}</span>
          <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Key'}
          </button>
        </div>
      </div>

      {/* POS Connection Setup Guide */}
      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>How to connect your POS to this Cloud Dashboard</h3>
        
        <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.6, fontWeight: '600' }}>
          <li>Open your local <strong>TYDE POS</strong> desktop app.</li>
          <li>Go to <strong>Settings</strong> → <strong>Connection Manager</strong> tab.</li>
          <li>Locate the <strong>Cloud Dashboard API Key</strong> field.</li>
          <li>Paste your key: <code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', color: '#94161c' }}>{sampleKey}</code></li>
          <li>Click <strong>Connect & Save Sync Key</strong>. Your POS will instantly begin syncing sales, bills, and customers to this dashboard.</li>
        </ol>
      </div>
    </div>
  );
}
