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
      <div className="flex items-center gap-3 p-4 bg-orange-50/70 rounded-2xl mb-6 border border-orange-100/80 shadow-xs">
        <img
          src={getImageUrl(user?.avatar, DEFAULT_AVATAR(user?.name || 'User'))}
          alt={user?.name}
          onError={(e) => handleImageError(e, DEFAULT_AVATAR(user?.name || 'User'))}
          className="w-11 h-11 rounded-full object-cover border-2 border-accent-main shrink-0 shadow-xs"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-text-primary truncate uppercase">{user?.name}</h4>
          <p className="text-[9px] text-accent-main font-extrabold uppercase tracking-tighter">{role}</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
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
                  ? 'bg-[rgba(255,138,61,0.14)] border border-[rgba(255,138,61,0.25)] text-[#F97316] shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-orange-50/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#F97316]' : 'text-text-muted group-hover:text-[#F97316] group-hover:scale-110 transition-transform'}`} />
                <span>{item.label}</span>
              </div>
              {item.label === 'Messages' && unreadMessagesCount > 0 && (
                <span className="bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full text-[9px] font-black shadow-xs">
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
        className="flex items-center gap-3 px-4 py-3.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-all w-full mt-6 border border-red-200/80 bg-white/60 shadow-xs"
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
    <nav className="mobile-bottom-nav lg:hidden bg-white/80 backdrop-blur-2xl border-t border-white/75 shadow-lg fixed bottom-0 left-0 right-0 z-40">
      <div className="flex items-center justify-around px-1 py-2 sm:py-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all min-w-[60px] ${
                isActive ? 'text-[#F97316]' : 'text-text-muted'
              }`}
            >
              <div className="relative">
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
                {item.label === 'Messages' && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[8px] text-white font-black flex items-center justify-center border-2 border-white">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black leading-none uppercase tracking-tighter ${isActive ? 'text-[#F97316]' : 'opacity-70'}`}>{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F97316] rounded-full" />
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
      <div className="glass-panel !bg-white/55 backdrop-blur-2xl rounded-[2.5rem] p-6 border border-white/75 shadow-xs w-full flex flex-col overflow-hidden relative group">
        <SidebarContent />
      </div>
    </aside>
  );
};

export { SidebarContent };
export default Sidebar;
