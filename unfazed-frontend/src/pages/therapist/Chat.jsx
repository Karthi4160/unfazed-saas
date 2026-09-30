import React, { useEffect, useState, useRef } from 'react';
import PageLayout from '../../components/common/PageLayout';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const TherapistChat = () => {
  const { user } = useAuth();
  const { socket, sendMessage: sendViaSocket } = useSocket();
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef();

  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const userId = user?._id || user?.id;

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    if (!socket) return;
    setConnected(socket.connected);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleReceive = (msg) => {
      const currentSelectedId = selectedRef.current?._id || selectedRef.current?.id;
      const senderId = msg.fromUserId?._id || msg.fromUserId?.id || msg.fromUserId;
      if (currentSelectedId && senderId !== currentSelectedId) return;

      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleSent = (msg) => {
      const currentSelectedId = selectedRef.current?._id || selectedRef.current?.id;
      const recipientId = msg.toUserId?._id || msg.toUserId?.id || msg.toUserId;
      if (currentSelectedId && recipientId !== currentSelectedId) return;

      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleError = (err) => console.error('[Chat] Socket error:', err);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('receive_message', handleReceive);
    socket.on('message_sent', handleSent);
    socket.on('error', handleError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('receive_message', handleReceive);
      socket.off('message_sent', handleSent);
      socket.off('error', handleError);
    };
  }, [socket]);

  useEffect(() => {
    if (selected) loadConversation(selected);
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.clients || []);
    } catch (err) { console.error(err); }
  };

  const loadConversation = async (client) => {
    try {
      const cId = client._id || client.id;
      const res = await api.get('/chat/conversation', {
        params: { otherUserId: cId, otherUserType: 'Client' }
      });
      setMessages(res.data.messages || []);
    } catch (err) { console.error(err); }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    const cId = selected._id || selected.id;
    const ok = sendViaSocket(cId, 'Client', input, 'text');
    if (ok) setInput('');
  };

  return (
    <PageLayout title="Messages" subtitle="Real-time chat with your clients.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        {/* Clients sidebar */}
        <div className="lg:col-span-1 card p-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <h3 className="text-sm font-semibold text-slate-900">Clients</h3>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {clients.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No clients yet</p>
            ) : (
              clients.map(c => (
                <button
                  key={c._id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-colors ${
                    selected?._id === c._id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-semibold flex-shrink-0">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${
                        selected?._id === c._id ? 'text-emerald-900' : 'text-slate-900'
                      }`}>
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">{c.email}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="lg:col-span-3 card p-0 overflow-hidden flex flex-col">
          {selected ? (
            <>
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-semibold">
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{selected.name}</div>
                  <div className="text-xs text-slate-500 truncate">{selected.email}</div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  connected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {connected ? 'Connected' : 'Offline'}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
                {messages.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-600 font-medium">No messages yet</p>
                    <p className="text-xs text-slate-500 mt-1">Send the first message to start the conversation</p>
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-slate-600 font-medium">Select a client</p>
              <p className="text-xs text-slate-500 mt-1">Choose a client to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default TherapistChat;