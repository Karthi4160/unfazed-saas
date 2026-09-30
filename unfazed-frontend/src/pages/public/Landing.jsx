import React from 'react';
import { Link } from 'react-router-dom';
import brand from '../../config/brand';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              U
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900">Unfazed</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900">Features</a>
            <a href="#how" className="text-sm text-slate-600 hover:text-slate-900">How it works</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2">
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Now accepting new therapists
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-[1.1]">
          Run your therapy practice.
          <br />
          <span className="text-emerald-600">Not your paperwork.</span>
        </h1>

        <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Unfazed replaces your calendar, CRM, notes, chat, and billing with one elegant platform — so you can focus on your clients, not your tools.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            Start free — no card required
          </Link>
          <Link
            to="/client/register"
            className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-6 py-3 rounded-lg border border-slate-200 transition-colors"
          >
            I'm a client →
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Trusted by therapists in India • Works on any device
        </p>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Everything your practice needs
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Six powerful modules. One subscription. Zero setup headaches.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '📅',
              title: 'Smart Scheduling',
              desc: 'Timezone-aware bookings, buffer times, and instant confirmations. No double-bookings ever.'
            },
            {
              icon: '👥',
              title: 'Client CRM',
              desc: 'Complete client history, digital intake forms, and consent capture — all in one place.'
            },
            {
              icon: '📝',
              title: 'Clinical Notes',
              desc: 'Private notes stay private. Share session summaries with clients securely.'
            },
            {
              icon: '💳',
              title: 'Payments & Invoices',
              desc: 'Razorpay-powered payments with auto-generated PDF invoices. GST-ready.'
            },
            {
              icon: '💬',
              title: 'Secure Chat',
              desc: 'Real-time messaging between you and your clients — encrypted, logged, compliant.'
            },
            {
              icon: '📊',
              title: 'Practice Analytics',
              desc: 'Revenue trends, no-show rates, active clients. Understand your business at a glance.'
            }
          ].map((f, i) => (
            <div key={i} className="p-6 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your profile', desc: 'Set up your branded therapist page with your specializations and availability.' },
              { step: '02', title: 'Invite your clients', desc: 'Share your unique link. Clients book, pay, and fill intake forms online.' },
              { step: '03', title: 'Focus on therapy', desc: 'Manage sessions, notes, and payments from a single beautiful dashboard.' }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-emerald-600 mb-3">{s.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Simple, honest pricing
          </h2>
          <p className="mt-3 text-slate-600">Start free. Upgrade as you grow.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <h3 className="font-semibold text-slate-900">Free</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">₹0<span className="text-base font-normal text-slate-500">/mo</span></p>
            <p className="mt-2 text-sm text-slate-600">Perfect for getting started</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>✓ Up to 5 active clients</li>
              <li>✓ 10 sessions per month</li>
              <li>✓ Basic scheduling</li>
              <li>✓ Client chat</li>
            </ul>
            <Link to="/register" className="mt-6 w-full btn-secondary justify-center">
              Start free
            </Link>
          </div>

          {/* Pro — highlighted */}
          <div className="p-6 rounded-xl border-2 border-emerald-600 bg-white relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="font-semibold text-slate-900">Professional</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">₹2,999<span className="text-base font-normal text-slate-500">/mo</span></p>
            <p className="mt-2 text-sm text-slate-600">For growing practices</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>✓ Up to 50 active clients</li>
              <li>✓ 100 sessions per month</li>
              <li>✓ Session packages</li>
              <li>✓ SOAP & DAP templates</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom branding</li>
            </ul>
            <Link to="/register" className="mt-6 w-full btn-primary justify-center">
              Get started
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-6 rounded-xl border border-slate-200 bg-white">
            <h3 className="font-semibold text-slate-900">Enterprise</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">₹9,999<span className="text-base font-normal text-slate-500">/mo</span></p>
            <p className="mt-2 text-sm text-slate-600">For clinics & organizations</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>✓ Unlimited clients</li>
              <li>✓ Multiple therapists</li>
              <li>✓ Premium support</li>
              <li>✓ API access</li>
              <li>✓ Export all data</li>
            </ul>
            <Link to="/register" className="mt-6 w-full btn-secondary justify-center">
              Contact sales
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Ready to simplify your practice?
          </h2>
          <p className="mt-3 text-slate-300">
            Join therapists who've ditched their spreadsheets for Unfazed.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Start your free trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              U
            </div>
            <span className="text-sm text-slate-600">© 2026 Unfazed. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/login" className="hover:text-slate-900">Therapist login</Link>
            <Link to="/client/login" className="hover:text-slate-900">Client login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;