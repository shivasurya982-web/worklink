import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSocket } from '../../context/SocketContext';
import {
  MessageSquare, Send, MapPin,
  CheckCheck, Circle, Phone, Edit2,
  Trash2, Navigation, ArrowLeft, Copy,
  Paperclip, Loader2, Search, X, User
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
  const [uploading, setUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchQuery] = useState('');

  // Responsive Toggle
  const [view, setView] = useState('list'); // 'list' or 'chat'

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedConversation) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('conversationId', selectedConversation._id);
    formData.append('type', 'image');

    try {
      await API.post('/chat/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      showToast('Error', 'Upload failed', 'error');
    } finally {
      setUploading(false);
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
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showToast('Permission Denied', 'Please allow location access in your browser settings and try again.', 'error');
            break;
          case error.POSITION_UNAVAILABLE:
            showToast('Position Unavailable', 'Your current location is unavailable. Please check your device settings.', 'error');
            break;
          case error.TIMEOUT:
            showToast('Timeout', 'Location request timed out. Please try again.', 'error');
            break;
          default:
            showToast('Error', 'Unable to get your current location. Please try again.', 'error');
            break;
        }
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
        <div className="flex justify-center my-6">
          <span className="bg-blue-50 text-accent-blue text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
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
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex h-[700px] max-h-[85vh]">

        {/* ── Sidebar ── */}
        <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-gray-100 bg-gray-50/30`}>
          <div className="p-4 border-b border-gray-100 bg-white">
            <h3 className="font-sora font-extrabold text-lg text-text-primary mb-4 flex items-center gap-2">
              Clients <span className="text-[10px] bg-accent-blue text-white px-2 py-0.5 rounded-full">{conversations.length}</span>
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-6 h-6 text-accent-blue animate-spin" />
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
                    className={`p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group ${
                      isSelected ? 'bg-white shadow-md border border-accent-blue/20' : 'hover:bg-white/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={recipient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name || 'User')}&background=3B82F6&color=fff`}
                        alt={recipient.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      {online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-xs font-bold text-text-primary truncate">{recipient.name}</h4>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] text-text-muted font-medium">
                            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          <button
                            onClick={(e) => handleDeleteConversation(e, conv._id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-accent-red rounded transition-all"
                            title="Delete Chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-text-muted truncate">
                         {conv.lastMessage || 'Open to view messages'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 px-6">
                <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-xs text-text-muted">No client threads yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Chat ── */}
        <div className={`${view === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white relative`}>
          {selectedConversation ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 sticky top-0 shrink-0">
                <button onClick={() => setView('list')} className="md:hidden p-2 -ml-2 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 text-text-primary" />
                </button>
                {(() => {
                  const recipient = getRecipient(selectedConversation);
                  const online = isUserOnline(recipient._id);
                  return (
                    <>
                      <div className="relative">
                        <img
                          src={recipient.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(recipient.name)}&background=3B82F6&color=fff`}
                          className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-100"
                        />
                        {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sora font-bold text-sm text-text-primary truncate">{recipient.name}</h4>
                        <p className="text-[10px] text-accent-blue font-bold uppercase tracking-wider">
                          {online ? 'Online' : 'Recent Client'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {recipient.phone && (
                          <a
                            href={`tel:${recipient.phone.replace(/\s+/g, '')}`}
                            className="p-3 rounded-full bg-blue-50 text-accent-blue hover:bg-accent-blue hover:text-white transition-all border border-blue-200"
                            title="Call Client"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#F1F4F9] relative" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/white-diamond.png")' }}>
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isOwn = String(msg.sender?._id || msg.sender) === String(user?._id || user);
                    const prevMsg = messages[index - 1];
                    return (
                      <React.Fragment key={msg._id}>
                        {renderDateSeparator(msg, prevMsg)}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}>
                          <div className={`relative max-w-[80%] sm:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>

                            {/* Hover Actions */}
                            <div className={`absolute -top-7 ${isOwn ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-100 p-0.5 z-20`}>
                               <button onClick={() => handleCopyMessage(msg.content)} className="p-1.5 hover:bg-gray-100 rounded text-text-muted" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                               {isOwn && msg.type === 'text' && (
                                 <>
                                   <button onClick={() => { setEditingMessage(msg); setMessageText(msg.content); }} className="p-1.5 hover:bg-gray-100 rounded text-text-muted" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                                   <button onClick={() => handleDeleteMessage(msg._id)} className="p-1.5 hover:bg-red-50 rounded text-accent-red" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                 </>
                               )}
                            </div>

                            <div
                              className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm transition-all relative ${
                                isOwn
                                  ? 'bg-accent-blue text-white rounded-tr-none shadow-blue-100'
                                  : 'bg-white text-text-primary rounded-tl-none border border-gray-100 shadow-gray-200'
                              }`}
                            >
                              {msg.type === 'image' && (
                                <div className="mb-2 -mx-1 -mt-1 rounded-xl overflow-hidden bg-black/5">
                                   <img src={msg.image} alt="Work Sample" className="max-h-60 w-full object-cover cursor-zoom-in" onClick={() => window.open(msg.image)} />
                                </div>
                              )}

                              {msg.type === 'location' ? (
                                <LocationMessage location={msg.location} isOwn={isOwn} />
                              ) : (
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                              )}

                              <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[8px] font-bold ${isOwn ? 'text-blue-100/70' : 'text-text-muted'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isOwn && (
                                  <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-white' : 'text-blue-200/40'}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                        <MessageSquare className="w-10 h-10 text-accent-blue opacity-30" />
                     </div>
                     <h4 className="font-sora font-bold text-text-primary">Conversation History</h4>
                     <p className="text-xs text-text-muted mt-1">Discuss project details and share updates here.</p>
                  </div>
                )}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white/80 border border-gray-100 rounded-2xl px-4 py-2 text-[10px] text-accent-blue font-bold italic animate-pulse">
                      Client is typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {uploading && (
                <div className="bg-white px-4 py-2 border-t border-gray-100 flex items-center gap-3">
                   <Loader2 className="w-4 h-4 text-accent-blue animate-spin" />
                   <span className="text-[10px] font-bold text-text-primary">Uploading image...</span>
                </div>
              )}

              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                  {editingMessage && (
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-2 rounded-xl border border-accent-blue/20">
                      <span className="text-[10px] font-bold text-accent-blue flex items-center gap-1 uppercase">
                         <Edit2 className="w-3 h-3" /> Editing Mode
                      </span>
                      <button type="button" onClick={() => { setEditingMessage(null); setMessageText(''); }} className="text-text-muted hover:text-accent-red"><X className="w-4 h-4" /></button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShareLocation}
                      disabled={locationLoading || !selectedConversation}
                      className="p-3 rounded-2xl bg-gray-50 text-text-muted hover:bg-accent-blue hover:text-white transition-all border border-gray-200 shadow-sm disabled:opacity-50"
                      title="Share Current Location"
                    >
                      {locationLoading ? <Loader2 className="w-5 h-5 animate-spin text-accent-blue" /> : <MapPin className="w-5 h-5" />}
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                        placeholder={editingMessage ? "Update your text..." : "Type your message..."}
                        className="w-full bg-gray-100 border-none rounded-2xl px-5 py-3.5 text-xs focus:ring-2 focus:ring-accent-blue/20 focus:bg-white transition-all shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="p-4 bg-accent-blue text-white rounded-2xl shadow-lg shadow-accent-blue/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
                    >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-current" />}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 bg-gray-50/50">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 border border-gray-100">
                 <MessageSquare className="w-12 h-12 text-accent-blue/20" />
              </div>
              <h3 className="font-sora font-extrabold text-xl text-text-primary">Communication Hub</h3>
              <p className="text-xs text-text-muted mt-2 max-w-[280px]">Select a client from your list to manage service details and provide updates.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerMessages;
