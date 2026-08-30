import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, User, Heart, MessageSquare,
  Settings, Users, Briefcase, CheckSquare, Grid, AlertCircle,
  BarChart2, LogOut, Sparkles, X, Menu, Star, Sliders, Mail,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Badge from '../common/Badge';

/* ── Nav item lists ── */
const customerItems = [
  { label: 'Dashboard',    path: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings',  path: '/customer/bookings',  icon: Calendar },
  { label: 'Find Workers', path: '/customer/search',    icon: Sparkles },
  { label: 'Favorites',   path: '/customer/favorites', icon: Heart },
  { label: 'Messages',    path: '/customer/messages',  icon: MessageSquare },
  { label: 'Complaints',  path: '/customer/complaints',icon: AlertCircle },
  { label: 'Profile',     path: '/customer/profile',   icon: User },
];

const workerItems = [
  { label: 'Dashboard',   path: '/worker/dashboard', icon: LayoutDashboard },
  { label: 'Available Jobs', path: '/worker/available-jobs', icon: Sparkles },
  { label: 'My Bookings', path: '/worker/bookings',  icon: Calendar },
  { label: 'Portfolio',   path: '/worker/portfolio', icon: Briefcase },
  { label: 'Messages',   path: '/worker/messages',  icon: MessageSquare },
  { label: 'Complaints', path: '/worker/complaints',icon: AlertCircle },
  { label: 'Profile',    path: '/worker/profile',   icon: User },
];

const adminItems = [
  { label: 'Control Center', path: '/admin/dashboard',       icon: LayoutDashboard },
  { label: 'All Workers',    path: '/admin/workers',         icon: Users },
  { label: 'Customers',      path: '/admin/customers',       icon: User },
  { label: 'Categories',     path: '/admin/categories',      icon: Grid },
  { label: 'Complaints',     path: '/admin/complaints',      icon: AlertCircle },
  { label: 'Website CMS Settings', path: '/admin/settings', icon: Sliders },
];

/* ── Sidebar content ── */
const SidebarContent = ({ onClose }) => {
  const { role, user, logout } = useAuth();
  const { unreadCount, unreadMessagesCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const items = role === 'admin' ? adminItems : role === 'worker' ? workerItems : customerItems;

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* User Card */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-blue-50 rounded-2xl mb-5 border border-accent-gold/20">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=D4AF37&color=fff`}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-accent-gold/40 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-text-primary truncate">{user?.name}</h4>
          <p className="text-[10px] text-text-muted capitalize">{role}</p>
        </div>
        <Badge variant="gold" size="xs">{role?.charAt(0).toUpperCase()}</Badge>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-accent-gold/15 to-accent-gold/5 text-text-primary font-semibold border-l-4 border-accent-gold shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent-gold' : 'text-text-muted'}`} />
                <span>{item.label}</span>
              </div>
              {item.label === 'Messages' && unreadMessagesCount > 0 && (
                <Badge variant="blue" size="xs">{unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}</Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-accent-red hover:bg-red-50 transition-colors w-full mt-3 border border-red-100"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

/* ── Mobile Bottom Tab Bar ── */
export const MobileBottomNav = () => {
  const { role } = useAuth();
  const { unreadCount, unreadMessagesCount } = useNotification();
  const location = useLocation();

  const items = role === 'admin'
    ? [
        { label: 'Dashboard', path: '/admin/dashboard',       icon: LayoutDashboard },
        { label: 'Workers',   path: '/admin/workers',         icon: Users },
        { label: 'Complaints',path: '/admin/complaints',      icon: AlertCircle },
        { label: 'Settings',  path: '/admin/settings',        icon: Sliders },
      ]
    : role === 'worker'
    ? [
        { label: 'Dashboard', path: '/worker/dashboard',  icon: LayoutDashboard },
        { label: 'Jobs',      path: '/worker/available-jobs', icon: Sparkles },
        { label: 'Bookings',  path: '/worker/bookings',   icon: Calendar },
        { label: 'Messages',  path: '/worker/messages',   icon: MessageSquare },
        { label: 'Profile',   path: '/worker/profile',    icon: User },
      ]
    : [
        { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
        { label: 'Search',    path: '/customer/search',    icon: Sparkles },
        { label: 'Bookings',  path: '/customer/bookings',  icon: Calendar },
        { label: 'Messages',  path: '/customer/messages',  icon: MessageSquare },
        { label: 'Profile',   path: '/customer/profile',   icon: User },
      ];

  return (
    <nav className="mobile-bottom-nav lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[52px] ${
                isActive ? 'text-accent-gold' : 'text-text-muted'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.label === 'Messages' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent-red rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

/* ── Desktop Sidebar ── */
const Sidebar = () => {
  return (
    <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 sticky top-28 h-[calc(100vh-140px)]">
      <div className="glass-panel bg-white/80 rounded-3xl p-4 border border-accent-gold/20 shadow-lg w-full flex flex-col overflow-hidden">
        <SidebarContent />
      </div>
    </aside>
  );
};

export { SidebarContent };
export default Sidebar;
