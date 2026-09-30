import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

const ClientBooking = () => {
  const { user } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTherapists(); }, []);
  useEffect(() => { if (selectedTherapist) fetchSlots(); }, [selectedTherapist, date]);

  const fetchTherapists = async () => {
    try {
      const res = await api.get('/therapists');
      setTherapists(res.data.therapists || []);
    } catch (err) { console.error(err); }
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/available-slots', {
        params: { therapistId: selectedTherapist._id, date }
      });
      setSlots(res.data.slots || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const bookSlot = async (slot) => {
    try {
      const res = await api.post('/bookings/book', {
        therapistId: selectedTherapist._id,
        clientId: user?._id || user?.id,
        startTime: slot.start,
        endTime: slot.end,
        duration: selectedTherapist.sessionDuration || 60
      });

      if (!res.data.payment) {
        alert('Booking confirmed!');
        window.location.href = '/client/sessions';
        return;
      }

      const payment = res.data.payment;
      const razorpayKey = payment.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey || razorpayKey.includes('xxxx')) {
        alert('Razorpay not configured. Booking created without payment.');
        window.location.href = '/client/sessions';
        return;
      }

      const options = {
        key: razorpayKey,
        amount: Math.round(payment.amount * 100),
        currency: payment.currency || 'INR',
        name: 'Unfazed',
        description: 'Therapy Session',
        order_id: payment.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              paymentRecordId: payment.id
            });
            alert('Payment successful! Booking confirmed.');
          } catch (err) { console.error(err); }
          window.location.href = '/client/sessions';
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#10b981' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  const sessionRate = selectedTherapist?.settings?.paymentSettings?.sessionRate || 1000;

  const formatSlotTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <PageLayout
      title="Book a Session"
      subtitle="Choose a therapist and pick a time that works for you."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* LEFT — Therapist selection (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">Select therapist</h3>
              <span className="badge-neutral">{therapists.length} available</span>
            </div>

            <div className="space-y-2">
              {therapists.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No therapists available</p>
              ) : (
                therapists.map(t => {
                  const isSelected = selectedTherapist?._id === t._id;
                  return (
                    <button
                      key={t._id}
                      type="button"
                      onClick={() => setSelectedTherapist(t)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer group ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                        }`}>
                          {t.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-emerald-900' : 'text-slate-900'
                          }`}>
                            {t.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {t.specializations?.slice(0, 2).join(' • ') || 'Therapist'}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selection detail card */}
          {selectedTherapist && (
            <div className="card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-semibold">
                  {selectedTherapist.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{selectedTherapist.name}</div>
                  <div className="text-xs text-emerald-700 mt-0.5 font-medium">Selected therapist</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-100">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Session rate</div>
                  <div className="text-base font-semibold text-slate-900">{formatCurrency(sessionRate)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Duration</div>
                  <div className="text-base font-semibold text-slate-900">
                    {selectedTherapist.sessionDuration || 60} min
                  </div>
                </div>
              </div>

              {selectedTherapist.bio && (
                <p className="text-xs text-slate-600 mt-4 pt-4 border-t border-emerald-100 leading-relaxed line-clamp-3">
                  {selectedTherapist.bio}
                </p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Date + Slots + Tips (3/5) */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedTherapist ? (
            <div className="card text-center py-20 min-h-[500px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-base font-medium text-slate-700">Ready to book?</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Select a therapist from the list to see their available time slots.
              </p>
            </div>
          ) : (
            <>
              {/* Date picker card */}
              <div className="card">
                <h3 className="section-title mb-4">Pick a date</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field flex-1 min-w-[200px]"
                  />
                  <div className="text-xs text-slate-500">
                    Availability: Mon–Fri, 9:00 AM – 5:00 PM
                  </div>
                </div>
              </div>

              {/* Slots card */}
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="section-title">Available time slots</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(date).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {!loading && slots.length > 0 && (
                    <span className="badge-success">
                      {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
                    <p className="text-sm text-slate-500 mt-3">Finding available slots...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-700">No available slots</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try picking a different weekday
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {slots.map((slot, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => bookSlot(slot)}
                          className="p-3.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-sm cursor-pointer transition-all duration-150 text-center group"
                        >
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
                            {formatSlotTime(slot.start)}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">60 min</div>
                        </button>
                      ))}
                    </div>

                    {/* Inline "Ready to book" hint */}
                    <div className="mt-5 pt-5 border-t border-slate-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Ready to book?</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Click any time slot above to proceed with payment and confirm your session.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* What happens next — fills empty space */}
              <div className="card">
                <h3 className="section-title mb-5">What happens next?</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: '1',
                      title: 'Pick your time slot',
                      desc: 'Choose a slot that fits your schedule.'
                    },
                    {
                      step: '2',
                      title: 'Complete payment',
                      desc: `Pay ${formatCurrency(sessionRate)} securely via Razorpay (UPI, cards, wallets).`
                    },
                    {
                      step: '3',
                      title: 'Confirmation',
                      desc: "You'll receive a booking confirmation with an invoice in your email."
                    },
                    {
                      step: '4',
                      title: 'Join your session',
                      desc: 'Access your session from the dashboard and connect with your therapist.'
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default ClientBooking;