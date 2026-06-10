import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export default function Support() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pressedMsg, setPressedMsg] = useState(null);
  const [undoQueue, setUndoQueue] = useState([]); // [{msgId, type, timeout}]
  const messagesEndRef = useRef(null);
  const pressTimer = useRef(null);

  useEffect(() => {
    if (profile?.id) fetchTickets();
  }, [profile?.id]);

  useEffect(() => {
    if (activeTicket) fetchMessages(activeTicket.id);
  }, [activeTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeTicket) return;
    const channel = supabase
      .channel('support_messages_' + activeTicket.id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${activeTicket.id}`,
      }, () => {
        fetchMessages(activeTicket.id);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeTicket?.id]);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', profile.id)
      .order('updated_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const fetchMessages = async (ticketId) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*, sender:sender_id(full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    // Filter out messages deleted for everyone or deleted for this user
    const visible = (data || []).filter(msg => {
      if (msg.deleted_for_everyone) return false;
      if (Array.isArray(msg.deleted_for) && msg.deleted_for.includes(profile.id)) return false;
      return true;
    });
    setMessages(visible);
  };

  const createTicket = async () => {
    if (!newSubject.trim()) return;
    setSending(true);
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({ user_id: profile.id, subject: newSubject.trim() })
      .select()
      .single();
    if (!error && data) {
      setTickets(prev => [data, ...prev]);
      setActiveTicket(data);
      setShowNewTicket(false);
      setNewSubject('');
    }
    setSending(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeTicket) return;
    setSending(true);
    const { data, error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: activeTicket.id,
        sender_id: profile.id,
        is_admin: false,
        message: newMessage.trim(),
      })
      .select('*, sender:sender_id(full_name)')
      .single();

    if (!error && data) {
      setMessages(prev => [...prev, data]);
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeTicket.id);
    }
    setNewMessage('');
    setSending(false);
  };

  // Long press to show delete options
  const handlePressStart = (msg) => {
    pressTimer.current = setTimeout(() => {
      setPressedMsg(msg.id);
    }, 400);
  };
  const handlePressEnd = (msg) => {
    // Only clear if it hasn't fired yet (short tap = dismiss, long press = show menu)
    clearTimeout(pressTimer.current);
  };
  const handleTouchEnd = (msg) => {
    clearTimeout(pressTimer.current);
    // If menu is already showing for this message, a second tap dismisses it
    if (pressedMsg === msg.id) {
      setPressedMsg(null);
    }
  };

  const deleteForMe = (msgId) => {
    setPressedMsg(null);
    // Optimistically hide
    setMessages(prev => prev.filter(m => m.id !== msgId));
    // Schedule actual DB update with undo window
    const timeout = setTimeout(async () => {
      const msg = await supabase.from('support_messages').select('deleted_for').eq('id', msgId).single();
      const existing = msg.data?.deleted_for || [];
      if (!existing.includes(profile.id)) {
        await supabase.from('support_messages')
          .update({ deleted_for: [...existing, profile.id] })
          .eq('id', msgId);
      }
      setUndoQueue(prev => prev.filter(u => u.msgId !== msgId));
    }, 5000);

    setUndoQueue(prev => [...prev, { msgId, type: 'me', timeout }]);
  };

  const deleteForEveryone = (msg) => {
    if (msg.sender_id !== profile.id) return; // only own messages
    setPressedMsg(null);
    setMessages(prev => prev.filter(m => m.id !== msg.id));
    const timeout = setTimeout(async () => {
      await supabase.from('support_messages')
        .update({ deleted_for_everyone: true })
        .eq('id', msg.id);
      setUndoQueue(prev => prev.filter(u => u.msgId !== msg.id));
    }, 5000);

    setUndoQueue(prev => [...prev, { msgId: msg.id, type: 'everyone', timeout, msg }]);
  };

  const undoDelete = (msgId) => {
    const entry = undoQueue.find(u => u.msgId === msgId);
    if (!entry) return;
    clearTimeout(entry.timeout);
    setUndoQueue(prev => prev.filter(u => u.msgId !== msgId));
    // Restore message
    fetchMessages(activeTicket.id);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  const statusColor = (s) => s === 'open' ? 'var(--green)' : s === 'resolved' ? '#448aff' : 'var(--text-muted)';
  const statusLabel = (s) => s === 'open' ? '🟢 Open' : s === 'resolved' ? '✅ Resolved' : '⬛ Closed';

  if (activeTicket) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="inner-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: 0 }}>

          {/* Header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => { setActiveTicket(null); setPressedMsg(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: 4 }}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{activeTicket.subject}</div>
                <div style={{ fontSize: 11, color: statusColor(activeTicket.status), marginTop: 2 }}>
                  {statusLabel(activeTicket.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Undo toasts */}
          {undoQueue.length > 0 && (
            <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 6, padding: '0 16px', zIndex: 100 }}>
              {undoQueue.map(u => (
                <div key={u.msgId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#1e1e2e', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 14px', fontSize: 13,
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Message deleted {u.type === 'everyone' ? 'for everyone' : 'for you'}
                  </span>
                  <button onClick={() => undoDelete(u.msgId)}
                    style={{ background: 'none', border: 'none', color: 'var(--green)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                    UNDO
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}
            onClick={() => setPressedMsg(null)}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 40 }}>
                No messages yet. Describe your issue below.
              </div>
            )}
            {messages.map(msg => {
              const isMine = msg.sender_id === profile.id;
              const isPressed = pressedMsg === msg.id;
              return (
                <div key={msg.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}
                  onMouseDown={() => handlePressStart(msg)}
                  onMouseUp={() => handlePressEnd(msg)}
                  onTouchStart={() => handlePressStart(msg)}
                  onTouchEnd={() => handleTouchEnd(msg)}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isPressed ? (isMine ? '#00b85e' : 'var(--surface)') : (isMine ? 'var(--green)' : 'var(--surface2)'),
                    color: isMine ? '#000' : 'var(--text)',
                    fontSize: 14, lineHeight: 1.4,
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                    {msg.is_admin ? '🛡 Support' : 'You'} · {formatDate(msg.created_at)}
                  </div>

                  {/* Delete options popup */}
                  {isPressed && (
                    <div style={{
                      display: 'flex', gap: 6, marginTop: 6,
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '6px 8px',
                    }}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => deleteForMe(msg.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <Trash2 size={11} /> Delete for me
                      </button>
                      {isMine && (
                        <button onClick={() => deleteForEveryone(msg)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.08)', color: '#ff4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <Trash2 size={11} /> Delete for everyone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeTicket.status !== 'closed' ? (
            <div style={{
              padding: '12px 16px', borderTop: '1px solid var(--border)',
              background: 'var(--surface)', display: 'flex', gap: 8, flexShrink: 0,
            }}>
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type your message..."
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'var(--surface2)', border: '1.5px solid var(--border)',
                  borderRadius: 20, color: 'var(--text)', fontSize: 14, outline: 'none',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              />
              <button onClick={sendMessage} disabled={sending || !newMessage.trim()}
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: newMessage.trim() ? 'var(--green)' : 'var(--surface2)',
                  border: 'none', cursor: newMessage.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.2s',
                }}>
                <Send size={18} color={newMessage.trim() ? '#000' : 'var(--text-muted)'} />
              </button>
            </div>
          ) : (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, borderTop: '1px solid var(--border)' }}>
              This ticket is closed.
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── Ticket list ──
  return (
    <div className="app-layout">
      <Navbar />
      <div className="inner-page">
        <div className="page-header">
          <Link to="/" className="back-btn"><ArrowLeft size={18} /></Link>
          <span className="page-title">Support</span>
        </div>

        <button onClick={() => setShowNewTicket(true)} className="btn-primary"
          style={{ width: '100%', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Plus size={18} /> New Support Ticket
        </button>

        {showNewTicket && (
          <div style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>What do you need help with?</div>
            <input type="text" value={newSubject} onChange={e => setNewSubject(e.target.value)}
              placeholder="e.g. My funds are frozen, transaction issue..."
              style={{ width: '100%', padding: '10px 14px', background: 'var(--surface2)', border: '1.5px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, outline: 'none', marginBottom: 10, fontFamily: 'Plus Jakarta Sans, sans-serif', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowNewTicket(false); setNewSubject(''); }} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={createTicket} disabled={sending || !newSubject.trim()} className="btn-primary" style={{ flex: 1 }}>
                {sending ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <MessageCircle size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No support tickets yet.</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Create one above to chat with our team.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tickets.map(ticket => (
              <div key={ticket.id} onClick={() => setActiveTicket(ticket)}
                style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageCircle size={18} color="var(--green)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</div>
                  <div style={{ fontSize: 11, color: statusColor(ticket.status) }}>{statusLabel(ticket.status)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(ticket.updated_at)}</div>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
