import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Trash2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PremiumButton from '../common/PremiumButton';
import Badge from '../common/Badge';
import API from '../../services/api';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, role, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

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
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'worker') return '/worker/dashboard';
    return '/customer/dashboard';
  };

  const getDashboardLabel = () => {
    if (role === 'admin') return 'Admin Panel';
    if (role === 'worker') return 'Pro Dashboard';
    return 'Dashboard';
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background-dark/95 shadow-xl border-b border-accent-main/20' : 'bg-transparent'
      }`}>
        <div className="container-responsive h-16 sm:h-20 flex items-center justify-between gap-4">

          {/* Left Side: Spacer/Logo Area */}
          <div className="flex-1 lg:flex-none">
            <Link to="/" className="inline-block">
               <span className="font-sora font-black text-xl sm:text-2xl orange-gradient-text tracking-tighter">WorkLink</span>
            </Link>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 rounded-xl hover:bg-white/5 text-text-secondary relative transition-colors"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-accent-red rounded-full text-[9px] text-white font-bold flex items-center justify-center border border-background-card">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 glass-card !bg-background-cardSecondary rounded-2xl shadow-2xl border border-border-primary/40 overflow-hidden">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-background-widget/40">
                        <h3 className="text-xs font-black uppercase tracking-widest">Recent Alerts</h3>
                        <button onClick={markAllAsRead} className="text-[10px] text-accent-bright font-black hover:underline uppercase">Mark Read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n._id} className="p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-[11px] font-bold text-white line-clamp-2">{n.message}</p>
                                <button onClick={(e) => handleDeleteNotification(e, n._id)} className="p-1 opacity-0 group-hover:opacity-100 text-accent-red hover:bg-red-500/10 rounded">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[9px] text-text-muted mt-2 block">{new Date(n.createdAt).toLocaleTimeString()}</span>
                            </div>
                          ))
                        ) : (
                          <p className="py-8 text-center text-[10px] text-text-muted uppercase font-bold">No Alerts</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Profile */}
                <div className="hidden sm:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors border border-border-primary/20"
                  >
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=F4510B&color=fff`}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-accent-main"
                    />
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 glass-card !bg-background-cardSecondary rounded-2xl p-2 shadow-2xl border border-border-primary/40">
                      <Link to={getDashboardPath()} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <LayoutDashboard className="w-4 h-4" /> {getDashboardLabel()}
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-accent-red hover:bg-red-500/10 rounded-xl transition-all">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <PremiumButton variant="outline" size="sm" className="hidden xs:flex">Login</PremiumButton>
                </Link>
                <Link to="/register/customer">
                  <PremiumButton variant="gold" size="sm">Get Started</PremiumButton>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-white hover:bg-white/5 transition-colors border border-border-primary/10"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-background-dark border-l border-accent-main/20 p-6 flex flex-col animate-slide-in">
            <div className="flex justify-between items-center mb-8">
              <span className="font-sora font-black text-xl orange-gradient-text">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white/5 rounded-xl text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 space-y-4">
              <Link to={getDashboardPath()} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl text-sm font-bold">
                <LayoutDashboard className="w-5 h-5 text-accent-bright" /> {getDashboardLabel()}
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl text-sm font-bold text-accent-red">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
