import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  Briefcase,
  LayoutDashboard,
  Zap,
  ShieldCheck,
  Star,
  Hammer,
  Droplets,
  Wrench,
  Paintbrush,
  Wind,
  Utensils,
  Scissors,
  Laptop,
  Headphones,
  Trash2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PremiumButton from '../common/PremiumButton';
import Badge from '../common/Badge';
import GlassCard from '../common/GlassCard';
import API from '../../services/api';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, role, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead, fetchNotifications, showToast } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location]);

  // Scrolled state for extra shadow
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const navLinks = [];

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'worker') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  const getDashboardLabel = () => {
    if (role === 'admin') return 'Admin Panel';
    if (role === 'worker') return 'Professional Dashboard';
    return 'My Dashboard';
  };

  const getMessagesPath = () => {
    return role === 'worker' ? '/worker/messages' : '/customer/messages';
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {}
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('Clear all alerts?')) return;
    try {
      await API.delete('/notifications/delete-all');
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <>
      {/* ── Main Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'top-0' : 'top-2 sm:top-4'
        }`}
      >
        <div className="container-responsive !max-w-full">
          <div className={`mx-auto transition-all duration-500 flex items-center h-16 sm:h-20 ${
            scrolled
              ? 'glass-nav shadow-xl rounded-b-3xl px-4 sm:px-6'
              : (isAuthenticated || location.pathname === '/')
                ? 'bg-transparent shadow-none border-transparent px-4 sm:px-8'
                : 'glass-nav shadow-md rounded-full px-4 sm:px-6 mt-4'
          }`}>
            {/* ── Left Side: Logo Removed ── */}
            <div className={`flex items-center ${isAuthenticated ? 'w-16 sm:w-48 lg:w-72 shrink-0' : 'w-16 sm:w-48 lg:w-72 shrink-0'}`}>
              <Link to="/" className="flex items-center gap-2">
              </Link>
            </div>

            {/* ── Center: Website Name ── */}
            <div className={`flex-1 flex justify-center items-center min-w-0 px-2 transition-all duration-500 ${
              (!scrolled && location.pathname === '/') ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
            }`}>
              <Link to={isAuthenticated ? getDashboardPath() : "/"} className="group truncate max-w-full">
                <h1 className={`font-sora font-extrabold tracking-tight text-center relative transition-all duration-300 ${
                  isAuthenticated ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-xl sm:text-2xl lg:text-3xl'
                }`}>
                  <span className="bg-gradient-to-r from-text-primary via-accent-gold to-text-primary bg-[length:200%_auto] animate-title-shimmer bg-clip-text text-transparent block truncate px-4">
                    WorkLink
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-accent-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
                </h1>
              </Link>
            </div>

            {/* ── Right Side ── */}
            <div className={`flex items-center gap-1.5 sm:gap-4 ${isAuthenticated || location.pathname === '/' ? 'w-16 sm:w-48 lg:w-72 justify-end shrink-0' : ''}`}>
              {/* Desktop Nav Links (public/guest only) */}
              {!isAuthenticated && (
                <div className="hidden lg:flex items-center gap-6 mr-4">
                  {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`text-sm font-medium transition-colors relative py-1 ${
                          isActive ? 'text-accent-gold font-semibold' : 'text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </div>
              )}

            {/* Notification Bell (authenticated) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className={`relative p-2 rounded-full transition-colors ${notifDropdownOpen ? 'bg-amber-50 text-accent-gold' : 'hover:bg-gray-100 text-text-secondary'}`}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-accent-red rounded-full text-[9px] text-white font-bold flex items-center justify-center border border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fade-in z-50 overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-amber-50/30">
                      <h3 className="font-sora font-bold text-sm text-text-primary flex items-center gap-2">
                        <Bell className="w-4 h-4 text-accent-gold" /> Recent Alerts
                      </h3>
                      <div className="flex items-center gap-3">
                         {notifications.some(n => !n.isRead) && (
                           <button onClick={markAllAsRead} className="text-[10px] text-accent-blue font-bold hover:underline">Mark Read</button>
                         )}
                         <button onClick={handleDeleteAllNotifications} className="text-[10px] text-accent-red font-bold hover:underline">Clear All</button>
                      </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 15).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                               if (!n.isRead) markAsRead(n._id);
                               if (n.type === 'chat') navigate(getMessagesPath());
                               else if (n.type === 'booking') navigate(role === 'worker' ? '/worker/bookings' : '/customer/bookings');
                               setNotifDropdownOpen(false);
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                              !n.isRead
                                ? 'bg-amber-50/40 border-accent-gold/10'
                                : 'bg-white border-transparent opacity-75 hover:opacity-100 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                 {n.type === 'chat' ? <MessageSquare className="w-3 h-3 text-accent-blue" /> : <Calendar className="w-3 h-3 text-accent-gold" />}
                                 <h4 className={`text-[11px] font-bold ${!n.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                                   {n.title}
                                 </h4>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(e, n._id)}
                                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 text-text-muted hover:text-accent-red transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-[10px] text-text-muted leading-tight line-clamp-2 pl-5">{n.message}</p>
                            <div className="mt-2 pl-5 flex items-center justify-between">
                               <span className="text-[9px] text-text-muted">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                               {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center">
                          <Bell className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <p className="text-[11px] text-text-muted">No notifications at the moment.</p>
                        </div>
                      )}
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setNotifDropdownOpen(false)}
                      className="p-3 bg-gray-50 text-center text-[10px] font-bold text-text-secondary hover:text-accent-gold transition-colors border-t border-gray-100"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Auth / Profile (Only Desktop) */}
            {isAuthenticated ? (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:pl-3 rounded-full hover:bg-gray-100/80 transition-colors border border-gray-200"
                  aria-expanded={profileDropdownOpen}
                  aria-haspopup="true"
                >
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=D4AF37&color=fff`
                    }
                    alt={user?.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-accent-gold"
                  />
                  <span className="hidden sm:block text-xs font-semibold text-text-primary max-w-[80px] lg:max-w-[110px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-text-muted" />
                </button>

                {/* Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-52 glass-card bg-white/98 rounded-2xl p-2 shadow-2xl border border-gray-100 animate-fade-in z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-text-primary truncate">{user?.name}</p>
                      <p className="text-[11px] text-text-muted truncate">{user?.phone}</p>
                      <Badge variant="gold" size="xs" className="mt-1">
                        {role?.toUpperCase()}
                      </Badge>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-accent-gold" />
                      {getDashboardLabel()}
                    </Link>
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-accent-red hover:bg-red-50 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <PremiumButton variant="outline" size="sm">Login</PremiumButton>
                </Link>
                <Link to="/register/customer">
                  <PremiumButton variant="gold" size="sm">Register</PremiumButton>
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-text-primary hover:bg-gray-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Menu Drawer ── */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-end p-5 border-b border-gray-100">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-text-muted hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info (if authenticated) */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 mx-4 mt-4 p-3 bg-amber-50 rounded-2xl border border-accent-gold/20">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=D4AF37&color=fff`}
              alt={user?.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-accent-gold/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.phone}</p>
            </div>
            <Badge variant="gold" size="xs">{role?.toUpperCase()}</Badge>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-1">
            {!isAuthenticated && navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-gold/15 to-accent-gold/5 text-text-primary font-semibold border-l-4 border-accent-gold'
                      : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Become a Worker (guests only) */}
            {!isAuthenticated && (
              <Link
                to="/register/worker"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-all"
              >
                Become a Worker
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-100" />

          {/* Action Buttons */}
          <div className="space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full btn-primary py-3 rounded-2xl text-sm font-bold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {getDashboardLabel()}
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-accent-red bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <PremiumButton variant="outline" size="md" fullWidth>Login</PremiumButton>
                </Link>
                <Link to="/register/customer" onClick={() => setMobileMenuOpen(false)}>
                  <PremiumButton variant="gold" size="md" fullWidth>Register Free</PremiumButton>
                </Link>
                <Link to="/register/worker" onClick={() => setMobileMenuOpen(false)}>
                  <PremiumButton variant="ai" size="md" fullWidth>Join as Professional</PremiumButton>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-gray-100 text-center">
          <p className="text-[11px] text-text-muted">WorkLink © {new Date().getFullYear()}</p>
        </div>
      </div>
    </>
  );
};

export default Navbar;
