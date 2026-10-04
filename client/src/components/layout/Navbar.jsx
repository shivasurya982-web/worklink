import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutGrid,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import PremiumButton from '../common/PremiumButton';
import API from '../../services/api';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, role, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead, fetchNotifications } = useNotification();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
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
    if (role === 'worker') return 'My Dashboard';
    return 'My Dashboard';
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md border-b border-slate-200/80 ${
        scrolled ? 'shadow-xs' : ''
      }`}>
        <div className="container-responsive h-16 sm:h-18 flex items-center justify-between gap-4">

          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
               <img
                 src="/logo.png"
                 alt="Worklyn Logo"
                 className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
               />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 relative transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <Bell className="w-5 h-5 text-slate-700" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
                      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</h3>
                        <button onClick={markAllAsRead} className="text-[10px] text-orange-600 font-bold hover:underline uppercase cursor-pointer">Mark All Read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n._id} className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                              <div className="flex justify-between items-start gap-2">
                                <p className="text-[11px] font-semibold text-slate-800 line-clamp-2">{n.message}</p>
                                <button onClick={(e) => handleDeleteNotification(e, n._id)} className="p-1 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-[9px] text-slate-400 mt-1 block font-medium">{new Date(n.createdAt).toLocaleTimeString()}</span>
                            </div>
                          ))
                        ) : (
                          <p className="py-6 text-center text-[10px] text-slate-400 uppercase font-bold">No new messages</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden sm:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200/80 cursor-pointer"
                  >
                    <img
                      src={getImageUrl(user?.avatar, DEFAULT_AVATAR(user?.name || 'U'))}
                      alt={user?.name || 'User'}
                      onError={(e) => handleImageError(e, DEFAULT_AVATAR(user?.name || 'U'))}
                      className="w-8 h-8 rounded-full object-cover border border-slate-300"
                    />
                    <ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 z-50">
                      <Link to={getDashboardPath()} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 hover:bg-orange-50/60 rounded-xl transition-all">
                        <LayoutGrid className="w-4 h-4" /> {getDashboardLabel()}
                      </Link>
                      <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer">
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
                  <PremiumButton variant="gold" size="sm">Register</PremiumButton>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white border-l border-slate-200 p-6 flex flex-col shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <span className="font-sora font-bold text-lg text-slate-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-xl text-slate-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 space-y-3">
              <Link to={getDashboardPath()} className="flex items-center gap-3 p-3.5 bg-orange-50/80 rounded-xl text-sm font-bold text-orange-700 hover:bg-orange-100">
                <LayoutGrid className="w-5 h-5 text-orange-600" /> {getDashboardLabel()}
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 p-3.5 bg-red-50 rounded-xl text-sm font-bold text-red-600 hover:bg-red-100">
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
