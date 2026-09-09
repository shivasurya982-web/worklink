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
      <div className="flex items-center gap-3 p-4 bg-background-widget/40 rounded-2xl mb-6 border border-accent-main/20 shadow-xl">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=F4510B&color=fff`}
          alt={user?.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-accent-main shrink-0 shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-text-primary truncate uppercase">{user?.name}</h4>
          <p className="text-[9px] text-text-muted font-extrabold uppercase tracking-tighter opacity-70">{role}</p>
        </div>
        <Badge variant="gold" size="xs" className="text-[9px] uppercase font-black">{role?.charAt(0)}</Badge>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-4 py-3 rounded-[1.2rem] text-xs font-bold transition-all group ${
                isActive
                  ? 'bg-accent-orange text-white shadow-xl border-l-4 border-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-accent-light group-hover:text-white'}`} />
                <span>{item.label}</span>
              </div>
              {item.label === 'Messages' && unreadMessagesCount > 0 && (
                <span className="bg-white text-accent-orange px-2 py-0.5 rounded-full text-[9px] font-black shadow-md">
                  {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-4 rounded-2xl text-xs font-bold text-accent-red hover:bg-red-500/10 transition-all w-full mt-6 border border-red-500/20 bg-background-widget/20 shadow-lg"
      >
        <LogOut className="w-5 h-5 shrink-0" />
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
    <nav className="mobile-bottom-nav lg:hidden border-t border-border-primary/30 shadow-[0_-10px_40px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-around px-1 py-2 sm:py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all min-w-[60px] ${
                isActive ? 'text-accent-bright' : 'text-text-muted'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,154,77,0.5)]' : ''}`} />
                {item.label === 'Messages' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent-orange rounded-full text-[8px] text-white font-black flex items-center justify-center border-2 border-background-dark">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black leading-none uppercase tracking-tighter ${isActive ? 'text-white' : 'opacity-60'}`}>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent-bright rounded-full shadow-[0_0_12px_#FF7A18]" />
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
      <div className="glass-panel !bg-gradient-to-b !from-[#8F2F08] !to-[#B93808] rounded-[2.5rem] p-5 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] w-full flex flex-col overflow-hidden">
        <SidebarContent />
      </div>
    </aside>
  );
};

export { SidebarContent };
export default Sidebar;
