import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import brand from '../../config/brand';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 opacity-90" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }} />

        <div className="relative z-10 p-12 flex flex-col justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center ${brand.colors.primaryTextClass} font-bold`}>
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">{brand.name}</span>
          </Link>

          {/* Center content */}
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Welcome back to your practice.
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-md">
              Manage clients, sessions, and payments — all from one calm dashboard.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-white">2,400+</div>
                <div className="text-xs text-emerald-200 mt-1">Therapists</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">48K+</div>
                <div className="text-xs text-emerald-200 mt-1">Sessions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">4.9★</div>
                <div className="text-xs text-emerald-200 mt-1">Rating</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="border-l-2 border-emerald-400 pl-4">
            <p className="text-emerald-50 text-sm italic leading-relaxed">
              "Unfazed replaced 5 different tools for my practice. I finally have one place for everything."
            </p>
            <p className="text-xs text-emerald-200 mt-2">— Dr. Priya S., Bangalore</p>
          </div>
        </div>
      </div>

      {/* RIGHT: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className={`w-9 h-9 rounded-lg ${brand.colors.primaryClass} flex items-center justify-center text-white font-bold`}>
              {brand.logoLetter}
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">{brand.name}</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-2">
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign up free
            </Link>
          </div>

          <div className="mt-4 text-center text-sm">
            <span className="text-slate-500">Are you a client? </span>
            <Link to="/client/login" className="font-medium text-slate-700 hover:text-slate-900 underline">
              Client login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;