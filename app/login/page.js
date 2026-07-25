'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Key, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { email, password, restaurantName } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('tyde_cloud_token', data.token);
        localStorage.setItem('tyde_cloud_account', JSON.stringify(data.account));
        router.push('/');
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '440px', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '54px', height: '54px', background: 'linear-gradient(135deg, #94161c 0%, #f97316 100%)', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 10px 20px rgba(148, 22, 28, 0.3)' }}>
            <Store size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{isRegister ? 'Create Cloud Account' : 'TYDE Cloud Login'}</h1>
          <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Access your remote restaurant sales & CRM dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecdd3', color: '#dc2626', fontSize: '13px', fontWeight: '700', marginBottom: '20px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>RESTAURANT NAME</label>
              <input
                type="text"
                placeholder="e.g. TYDE Cafe"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none' }}
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>EMAIL ADDRESS</label>
            <input
              type="email"
              placeholder="owner@tydecafe.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600', outline: 'none' }}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '14px' }}>
            {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Sign In')} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ background: 'none', border: 'none', color: '#94161c', fontWeight: '800', cursor: 'pointer' }}>
            {isRegister ? 'Log In' : 'Create One'}
          </button>
        </div>
      </div>
    </div>
  );
}
