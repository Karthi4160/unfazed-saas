import React, { useEffect, useState, useRef } from 'react';
import PageLayout from '../../components/common/PageLayout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';

const ClientChat = () => {
  const { user } = useAuth();
  const { socket, sendMessage: sendViaSocket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [therapistId, setTherapistId] = useState(null);
  const [therapistName, setTherapistName] = useState('Your Therapist');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef();

  const userId = user?._id || user?.id;

  // ---- Load therapist + conversation ----
  useEffect(() => {
    if (!userId) return;
    loadData();
  }, [userId]);

  // ---- Attach socket listeners ----
  useEffect(() => {
    if (!socket) return;

    setConnected(socket.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onReceive = (msg) => {
      console.log('[ClientChat] RECEIVED:', msg.message);
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const onSent = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceive);
    socket.on('message_sent', onSent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceive);
      socket.off('message_sent', onSent);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      let therapist = null;

      // Try from bookings
      try {
        const bookings = await api.get(`/bookings/client/${userId}`);
        therapist = bookings.data.bookings?.[0]?.therapistId;
      } catch (e) {
        // ignore
      }

      // Fallback to client profile
      if (!therapist) {
        try {
          const clientRes = await api.get(`/clients/${userId}`);
          const t = clientRes.data.client?.therapistId;
          if (t) therapist = typeof t === 'object' ? t : { _id: t, name: 'Your Therapist' };
        } catch (e) {
          // ignore
        }
      }

      if (!therapist) {
        setLoading(false);
        return;
      }

      const tId = therapist._id || therapist.id;
      setTherapistId(tId);
      setTherapistName(therapist.name || 'Your Therapist');

      // Load messages
      try {
        const msgsRes = await api.get('/chat/client/conversation', {
          params: { otherUserId: tId, otherUserType: 'Therapist' }
        });
        setMessages(msgsRes.data.messages || []);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    setSendError('');
    const trimmed = input.trim();
    if (!trimmed) return;

    if (!therapistId) {
      setSendError('No therapist found');
      return;
    }

    if (!socket || !socket.connected) {
      setSendError('Reconnecting... please wait');
      return;
    }

    const ok = sendViaSocket(therapistId, 'Therapist', trimmed, 'text');
    if (ok) setInput('');
    else setSendError('Failed to send');
  };

  return (
    <PageLayout title="Chat" subtitle="Message your therapist securely.">
      <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-semibold">
              {therapistName?.[0]?.toUpperCase() || 'T'}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{therapistName}</div>
              <div className="text-xs text-slate-500">Your therapist</div>
            </div>
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {connected ? '● Connected' : '○ Offline'}
          </div>
        </div>

        {sendError && (
          <div className="bg-red-50 border-b border-red-100 px-5 py-2 text-xs text-red-700">
            {sendError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm font-medium text-slate-700">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1">Send a message to start the conversation</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const senderId = m.fromUserId?._id || m.fromUserId?.id || m.fromUserId;
              const isMe = senderId === userId;
              return (
                <div key={m._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    isMe ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900 border border-slate-100'
                  }`}>
                    <p className="text-sm">{m.message}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-100 p-4 flex gap-2 flex-shrink-0 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button type="submit" disabled={!input.trim() || !therapistId} className="btn-primary px-5 disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default ClientChat;