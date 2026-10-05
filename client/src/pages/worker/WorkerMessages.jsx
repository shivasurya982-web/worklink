import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSocket } from '../../context/SocketContext';
import {
  MessageSquare, Send, MapPin,
  CheckCheck, Phone, Edit2,
  Trash2, ArrowLeft, Copy,
  Loader2, Search, X, User
} from 'lucide-react';
import API from '../../services/api';
import LocationMessage from '../../components/chat/LocationMessage';

const WorkerMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket, isUserOnline } = useSocket();
  const { fetchNotifications, showToast } = useNotification();
  const [searchParams] = useSearchParams();
  const queryCustomerId = searchParams.get('customer');

  // UI State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchQuery] = useState('');

  // Responsive Toggle
  const [view, setView] = useState('list'); // 'list' or 'chat'

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    if (socket && user) {
      socket.emit('clear_all_chat_notifications', { userId: user._id });
    }
    fetchNotifications();
  }, [socket, user?._id]);

  useEffect(() => {
    if (queryCustomerId && !loading) {
      initiateConversation(queryCustomerId);
    }
  }, [queryCustomerId, loading]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (newMessage) => {
        if (selectedConversation && String(newMessage.conversation) === String(selectedConversation._id)) {
          setMessages((prev) => {
            if (prev.some((m) => String(m._id) === String(newMessage._id))) return prev;
            return [...prev, newMessage];
          });
          scrollToBottom();
          socket.emit('mark_read', { conversationId: selectedConversation._id, userId: user._id });
        }
        fetchConversations();
      };

      const handleUserTyping = ({ conversationId }) => {
        if (selectedConversation && String(conversationId) === String(selectedConversation._id)) {
          setIsTyping(true);
        }
      };

      const handleUserStopTyping = ({ conversationId }) => {
        if (selectedConversation && String(conversationId) === String(selectedConversation._id)) {
          setIsTyping(false);
        }
      };

      const handleMessageEdited = (editedMsg) => {
        setMessages(prev => prev.map(m => m._id === editedMsg._id ? editedMsg : m));
      };

      const handleMessageDeleted = (deletedId) => {
        setMessages(prev => prev.filter(m => m._id !== deletedId));
        fetchConversations();
      };

      socket.on('new_message', handleNewMessage);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);
      socket.on('message_edited', handleMessageEdited);
      socket.on('message_deleted', handleMessageDeleted);

      return () => {
        socket.off('new_message', handleNewMessage);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stop_typing', handleUserStopTyping);
        socket.off('message_edited', handleMessageEdited);
        socket.off('message_deleted', handleMessageDeleted);
      };
    }
  }, [socket, selectedConversation?._id]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      setView('chat');
      if (socket) {
        socket.emit('join_conversation', selectedConversation._id);
        socket.emit('mark_read', { conversationId: selectedConversation._id, userId: user._id });
      }
    }
  }, [selectedConversation?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchConversations = async () => {
    try {
      const res = await API.get('/chat/conversations');
      if (res.success) {
        setConversations(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateConversation = async (customerId) => {
    try {
      const res = await API.post('/chat/conversations', {
        recipientId: customerId,
        recipientModel: 'Customer',
      });
      if (res.success && res.data) {
        setSelectedConversation(res.data);
        setView('chat');
        fetchConversations();
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await API.get(`/chat/conversations/${convId}/messages`);
      if (res.success) {
        setMessages(res.data || []);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedConversation || sending) return;

    if (editingMessage) {
      handleSaveEdit();
      return;
    }

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await API.post('/chat/messages', {
        conversationId: selectedConversation._id,
        content: text,
        type: 'text',
      });
    } catch (err) {
      showToast('Error', 'Failed to send', 'error');
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      showToast('Error', 'Your browser does not support geolocation.', 'error');
      return;
    }

    setLocationLoading(true);

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await API.post('/chat/messages', {
            conversationId: selectedConversation._id,
            content: `📍 Shared a location`,
            type: 'location',
            location: { lat, lng }
          });
          if (res.success) {
            showToast('Success', 'Location shared successfully', 'success');
            scrollToBottom();
          }
        } catch (err) {
          showToast('Error', 'Unable to send location. Please check your connection.', 'error');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        showToast('Error', 'Unable to get location.', 'error');
      },
      geoOptions
    );
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    showToast('Copied', 'Text copied', 'info');
  };

  const handleSaveEdit = async () => {
    if (!messageText.trim() || !editingMessage) return;
    setSending(true);
    try {
      await API.put(`/chat/messages/${editingMessage._id}`, { content: messageText.trim() });
      setEditingMessage(null);
      setMessageText('');
    } catch (err) {} finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete?')) return;
    try {
      await API.delete(`/chat/messages/${msgId}`);
    } catch (err) {}
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm('Remove this conversation from your list?')) return;
    try {
      await API.delete(`/chat/conversations/${convId}`);
      showToast('Deleted', 'Chat removed', 'info');
      setConversations(prev => prev.filter(c => c._id !== convId));
      if (selectedConversation?._id === convId) {
        setSelectedConversation(null);
        setView('list');
      }
    } catch (err) {
      showToast('Error', 'Failed to remove chat', 'error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRecipient = (conv) => {
    if (!conv || !conv.participants) return {};
    const recipient = conv.participants.find(
      (p) => String(p.user?._id || p.user) !== String(user?._id || user)
    );
    return recipient?.user || {};
  };

  const formatMessageDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  const renderDateSeparator = (currentMsg, prevMsg) => {
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
    if (currentDate !== prevDate) {
      return (
        <div className="flex justify-center my-4">
          <span className="bg-orange-100 text-accent-main text-[10px] font-bold px-3 py-1 rounded-full border border-orange-200 uppercase tracking-wider">
            {formatMessageDate(currentMsg.createdAt)}
          </span>
        </div>
      );
    }
    return null;
  };

  const filteredConversations = conversations.filter(c =>
    getRecipient(c).name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Client Inbox" subtitle="Manage your service requests and client updates">
      <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-sm border border-white/60 overflow-hidden flex h-[750px] max-h-[85vh]">

        {/* ── Sidebar ── */}
        <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-gray-200 bg-orange-50/30`}>
          <div className="p-5 border-b border-gray-200 bg-white/60">
            <h3 className="font-sora font-black text-base text-text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
              Clients <span className="text-[10px] bg-accent-main text-white px-2.5 py-0.5 rounded-full shadow-xs">{conversations.length}</span>
            </h3>
            <div className="relative group">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-accent-main" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-accent-main/10 focus:border-accent-main transition-all font-bold text-text-primary placeholder:text-text-muted uppercase tracking-wider"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-accent-main animate-spin" />
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const recipient = getRecipient(conv);
                const isSelected = selectedConversation?._id === conv._id;
                const online = isUserOnline(recipient._id);
                return (
                  <div
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3.5 rounded-2xl flex items-center gap-3.5 transition-all cursor-pointer group relative ${
                      isSelected ? 'bg-accent-main text-white shadow-sm' : 'hover:bg-white/80 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={getImageUrl(recipient.avatar, DEFAULT_AVATAR(recipient.name || 'User'))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(recipient.name || 'User'))}
                        alt={recipient.name}
                        className={`w-12 h-12 rounded-2xl object-cover border-2 shadow-xs ${isSelected ? 'border-white' : 'border-accent-main'}`}
                      />
                      {online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-black truncate uppercase tracking-tight">{recipient.name}</h4>
                        <div className="flex items-center gap-1.5">
                           <span className={`text-[9px] font-bold ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          <button
                            onClick={(e) => handleDeleteConversation(e, conv._id)}
                            className={`p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-red-50 text-red-500'}`}
                            title="Delete Chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className={`text-[11px] truncate font-medium ${isSelected ? 'text-white/90' : 'text-text-muted'}`}>
                         {conv.lastMessage || 'Ready for message...'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 px-6 opacity-60">
                <User className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">No active clients</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Chat Window ── */}
        <div className={`${view === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white/40 relative backdrop-blur-2xl`}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl z-10 sticky top-0 shrink-0">
                <button onClick={() => setView('list')} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-text-primary">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {(() => {
                  const recipient = getRecipient(selectedConversation);
                  const online = isUserOnline(recipient._id);
                  return (
                    <>
                      <div className="relative">
                        <img
                          src={getImageUrl(recipient.avatar, DEFAULT_AVATAR(recipient.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(recipient.name))}
                          className="w-11 h-11 rounded-2xl object-cover shadow-xs border-2 border-accent-main"
                        />
                        {online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sora font-black text-base text-text-primary truncate tracking-tight">{recipient.name}</h4>
                        <div className="flex items-center gap-1.5">
                           <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-text-muted'}`} />
                           <p className={`text-[10px] font-bold uppercase tracking-wider ${online ? 'text-emerald-600' : 'text-text-muted'}`}>
                             {online ? 'ONLINE' : 'OFFLINE'}
                           </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {recipient.phone && (
                          <a
                            href={`tel:${recipient.phone.replace(/\s+/g, '')}`}
                            className="p-3 rounded-2xl bg-orange-50 text-accent-main hover:bg-accent-main hover:text-white transition-all border border-orange-100 shadow-xs"
                            title="Call Client"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-transparent relative custom-scrollbar">
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isOwn = String(msg.sender?._id || msg.sender) === String(user?._id || user);
                    const prevMsg = messages[index - 1];
                    return (
                      <React.Fragment key={msg._id}>
                        {renderDateSeparator(msg, prevMsg)}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}>
                          <div className={`relative max-w-[85%] sm:max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>

                            {/* Hover Actions */}
                            <div className={`absolute -top-7 ${isOwn ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 bg-white rounded-xl shadow-md border border-gray-200 p-1 z-20`}>
                               <button onClick={() => handleCopyMessage(msg.content)} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-muted hover:text-text-primary" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                               {isOwn && msg.type === 'text' && (
                                 <>
                                   <button onClick={() => { setEditingMessage(msg); setMessageText(msg.content); }} className="p-1.5 hover:bg-gray-100 rounded-lg text-text-muted hover:text-accent-main" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                                   <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                 </>
                               )}
                            </div>

                            <div
                              className={`rounded-2xl px-4 py-3 text-sm shadow-xs transition-all relative ${
                                isOwn
                                  ? 'bg-accent-main text-white rounded-tr-none'
                                  : 'bg-white/80 text-text-primary rounded-tl-none border border-gray-200'
                              }`}
                            >
                              {msg.type === 'location' ? (
                                <LocationMessage location={msg.location} isOwn={isOwn} />
                              ) : (
                                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                              )}

                              <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${isOwn ? 'text-white/80' : 'text-text-muted'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isOwn && (
                                  <CheckCheck className={`w-3.5 h-3.5 ${msg.isRead ? 'text-white' : 'text-white/50'}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-10 space-y-4">
                     <div className="w-20 h-20 bg-orange-50/80 rounded-3xl flex items-center justify-center border border-orange-100/80">
                        <MessageSquare className="w-10 h-10 text-accent-main" />
                     </div>
                     <h4 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight">Client Conversation</h4>
                  </div>
                )}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white/80 border border-gray-200 rounded-xl px-4 py-2 text-[10px] text-accent-main font-bold uppercase tracking-wider italic animate-pulse shadow-xs">
                      Client is typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-xl shrink-0">
                <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto">
                  {editingMessage && (
                    <div className="flex items-center justify-between bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 mb-2">
                      <span className="text-[10px] font-bold text-accent-main flex items-center gap-2 uppercase tracking-wider">
                         <Edit2 className="w-3.5 h-3.5" /> Editing Message
                      </span>
                      <button type="button" onClick={() => { setEditingMessage(null); setMessageText(''); }} className="text-text-muted hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  )}

                  <div className="flex items-end gap-2 bg-white/90 p-2 rounded-2xl border border-gray-200 shadow-xs">
                    <button
                      type="button"
                      onClick={handleShareLocation}
                      disabled={locationLoading || !selectedConversation}
                      className="p-3 rounded-xl bg-orange-50/80 text-accent-main hover:bg-accent-main hover:text-white transition-all border border-orange-100/80 disabled:opacity-40 shrink-0 cursor-pointer"
                      title="Share Location"
                    >
                      {locationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                    </button>

                    <textarea
                      rows={1}
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      placeholder="Write a message..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-2.5 px-2 text-text-primary placeholder:text-text-muted resize-none max-h-32 custom-scrollbar overflow-y-auto"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />

                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="p-3 bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] hover:from-[#3A3A3C] hover:to-[#2C2C2E] text-white rounded-xl shadow-xs active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-current" />}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-6">
              <div className="w-24 h-24 bg-white/80 rounded-3xl flex items-center justify-center shadow-xs border border-gray-200">
                 <MessageSquare className="w-12 h-12 text-accent-main" />
              </div>
              <div className="space-y-2">
                 <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight">Client Inbox</h3>
                 <p className="text-xs font-bold text-text-muted max-w-[280px] mx-auto leading-relaxed uppercase tracking-wider">Select a conversation on the left to start messaging your client.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerMessages;
