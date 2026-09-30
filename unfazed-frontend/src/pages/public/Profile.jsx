import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import brand from '../../config/brand';

const PublicProfile = () => {
  const { slug } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await axios.get(`${API_URL}/auth/profile/${slug}`);
      setTherapist(res.data.therapist);
      document.title = `${res.data.therapist.name} | ${brand.name}`;
    } catch (err) {
      setError('Profile not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">{error}</h1>
          <p className="text-sm text-slate-500 mb-6">
            The therapist profile you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  const sessionRate = therapist.settings?.paymentSettings?.sessionRate || 1000;
  const duration = therapist.sessionDuration || 60;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">{brand.name}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/client/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5">
              Sign in
            </Link>
            <Link
              to="/client/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-14">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            {therapist.profileImage ? (
              <img
                src={therapist.profileImage}
                alt={therapist.name}
                className="w-24 h-24 rounded-2xl border-4 border-white/20 shadow-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl border-4 border-white/20 bg-white/10 backdrop-blur flex items-center justify-center text-4xl font-bold flex-shrink-0">
                {therapist.name[0]}
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {therapist.name}
              </h1>

              <p className="text-emerald-100 text-base mb-3">
                {therapist.credentials || 'Licensed Therapist'}
              </p>

              {/* Meta badges */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-100">
                {therapist.yearsOfExperience > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {therapist.yearsOfExperience} years experience
                  </div>
                )}
                {therapist.languages?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    {therapist.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* CTA on desktop */}
            <div className="hidden md:block flex-shrink-0">
              <Link
                to="/client/register"
                className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
              >
                Book a session
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {therapist.bio && (
              <div className="card">
                <h2 className="section-title mb-4">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {therapist.bio}
                </p>
              </div>
            )}

            {/* Specializations */}
            {therapist.specializations?.length > 0 && (
              <div className="card">
                <h2 className="section-title mb-4">Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {therapist.specializations.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages (mobile only — hero shows on desktop) */}
            {therapist.languages?.length > 0 && (
              <div className="card md:hidden">
                <h2 className="section-title mb-4">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {therapist.languages.map((l, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What to expect */}
            <div className="card">
              <h2 className="section-title mb-4">What to expect</h2>
              <div className="space-y-3">
                {[
                  { label: 'Session duration', value: `${duration} minutes` },
                  { label: 'Format', value: 'One-on-one, secure video call' },
                  { label: 'Language', value: therapist.languages?.join(', ') || 'English' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <span className="text-sm font-medium text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — booking card */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <div className="mb-5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Session rate</div>
                <div className="text-3xl font-bold text-slate-900">
                  ₹{sessionRate.toLocaleString('en-IN')}
                  <span className="text-base font-normal text-slate-500"> / {duration} min</span>
                </div>
              </div>

              <div className="space-y-3 pt-5 border-t border-slate-100">
                {[
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', text: `${duration} minute session` },
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Secure & confidential' },
                  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', text: 'Pay via UPI, cards, or wallets' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.text}
                  </div>
                ))}
              </div>

              <Link
                to="/client/register"
                className="mt-5 w-full btn-primary justify-center py-3"
              >
                Book a session
              </Link>

              <p className="text-xs text-slate-500 text-center mt-3">
                You'll need a free account to book
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <Link to="/client/login" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white mt-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              {brand.logoLetter}
            </div>
            <span className="text-sm text-slate-600">
              Powered by {brand.name} · © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <Link to="/client/login" className="hover:text-slate-900">Client login</Link>
            <Link to="/login" className="hover:text-slate-900">Therapist login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicProfile;