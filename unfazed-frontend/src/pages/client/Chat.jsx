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
  const bottomRef = useRef();

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;
    fetchTherapistAndMessages();
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    setConnected(socket.connected);

    const handleReceive = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleSent = (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleError = (err) => console.error('[Chat] Socket error:', err);

    socket.on('receive_message', handleReceive);
    socket.on('message_sent', handleSent);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('error', handleError);

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('message_sent', handleSent);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('error', handleError);
    };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTherapistAndMessages = async () => {
    try {
      const bookings = await api.get(`/bookings/client/${userId}`);
      const therapist = bookings.data.bookings?.[0]?.therapistId;
      if (therapist) {
        const tId = therapist._id || therapist.id;
        setTherapistId(tId);
        setTherapistName(therapist.name || 'Your Therapist');
        const msgs = await api.get('/chat/client/conversation', {
          params: { otherUserId: tId, otherUserType: 'Therapist' }
        });
        setMessages(msgs.data.messages || []);
      }
    } catch (err) {
      console.error('Chat load error:', err.response?.data || err.message);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !therapistId) return;
    const ok = sendViaSocket(therapistId, 'Therapist', input, 'text');
    if (ok) setInput('');
  };

  return (
    <PageLayout title="Chat" subtitle="Message your therapist securely.">
      <div className="card p-0 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        {/* Header */}
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
          <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            connected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {connected ? '● Connected' : '○ Offline'}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-700">No messages yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Send a message to start the conversation
              </p>
            </div>
          )}

          {messages.map((m, i) => {
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
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-slate-100 p-4 flex gap-2 flex-shrink-0 bg-white">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={connected ? "Type a message..." : "Connecting..."}
            className="input-field flex-1"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!connected || !input.trim()}
            className="btn-primary px-5"
          >
            Send
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default ClientChat;