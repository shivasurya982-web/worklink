import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, User, Heart, MessageSquare,
  Users, Briefcase, Grid, AlertCircle, LogOut, Sparkles, Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

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
  const { unreadMessagesCount } = useNotification();
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
      <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl mb-5 border border-slate-200/80">
        <img
          src={getImageUrl(user?.avatar, DEFAULT_AVATAR(user?.name || 'User'))}
          alt={user?.name}
          onError={(e) => handleImageError(e, DEFAULT_AVATAR(user?.name || 'User'))}
          className="w-10 h-10 rounded-full object-cover border border-indigo-600 shrink-0 shadow-xs"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate uppercase">{user?.name}</h4>
          <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">{role}</p>
        </div>
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
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                isActive
                  ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span>{item.label}</span>
              </div>
              {item.label === 'Messages' && unreadMessagesCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-xs">
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
        className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all w-full mt-4 border border-red-200/80 bg-white shadow-xs cursor-pointer"
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
  const { unreadMessagesCount } = useNotification();
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
    <nav className="mobile-bottom-nav lg:hidden bg-white border-t border-slate-200 shadow-lg fixed bottom-0 left-0 right-0 z-40">
      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all min-w-[55px] ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-105' : ''}`} />
                {item.label === 'Messages' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white font-extrabold flex items-center justify-center border-2 border-white">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold leading-none uppercase tracking-tight ${isActive ? 'text-indigo-600' : 'opacity-70'}`}>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
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
    <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 sticky top-24 h-[calc(100vh-120px)]">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs w-full flex flex-col overflow-hidden relative group">
        <SidebarContent />
      </div>
    </aside>
  );
};

export { SidebarContent };
export default Sidebar;
