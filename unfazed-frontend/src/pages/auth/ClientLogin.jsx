import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import brand from '../../config/brand';

const ClientLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { clientLogin, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await clientLogin(form.email, form.password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 opacity-90" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 80% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)'
        }} />

        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-emerald-700 font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">{brand.name}</span>
          </Link>

          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Your sessions, all in one place.
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
              Book sessions, chat with your therapist, and access shared notes — anytime, anywhere.
            </p>

            <ul className="mt-10 space-y-4">
              {[
                'Book sessions in seconds',
                'Pay securely with UPI or cards',
                'Chat with your therapist privately',
                'Access your shared session notes'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-emerald-900" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-emerald-50 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-emerald-200 text-xs">
            🔒 Your data is private and encrypted.
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">{brand.name}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Client login</h2>
            <p className="text-sm text-slate-500 mt-2">
              Welcome back. Sign in to view your sessions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/client/register" className="font-medium text-emerald-600 hover:text-emerald-700">
              Create an account
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-slate-500">Are you a therapist? </span>
            <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900 underline">
              Therapist login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;