import { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiFolder,
  HiChatAlt2,
  HiCreditCard,
  HiBell,
  HiCog,
  HiUsers,
  HiPlusCircle,
  HiMenu,
  HiX,
  HiLogout,
  HiCollection
} from 'react-icons/hi';
import useAuth from '../hooks/useAuth';
import { logout } from '../redux/slices/authSlice';
import Avatar from '../components/common/Avatar';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logoutLoading } = useAuth();
  const dispatch = useDispatch();
  const navigate = navigateFn();
  const { unreadCount } = useSelector((state) => state.notifications || { unreadCount: 0 });
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/student')) return 'Student Dashboard';
    if (path.includes('/dashboard/client')) return 'Client Dashboard';
    if (path.includes('/dashboard/admin')) return 'Admin Control Panel';
    if (path.includes('/dashboard/my-projects')) return 'My Posted Projects';
    if (path.includes('/dashboard/create-project')) return 'Post a New Project';
    if (path.includes('/dashboard/edit-project')) return 'Edit Project';
    if (path.includes('/dashboard/my-bids')) return 'My Submitted Bids';
    if (path.includes('/dashboard/chat')) return 'Chat & Discussions';
    if (path.includes('/dashboard/payments')) return 'Payment Dashboard';
    if (path.includes('/dashboard/notifications')) return 'All Notifications';
    if (path.includes('/dashboard/settings')) return 'Account Settings';
    return 'Portal Overview';
  };

  function navigateFn() {
    try {
      return useNavigate();
    } catch (e) {
      return () => {};
    }
  }

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      navigate('/login');
    });
  };

  const getLinks = () => {
    if (user?.role === 'student') {
      return [
        { path: '/dashboard/student', label: 'Dashboard', icon: HiHome },
        { path: '/projects', label: 'Browse Projects', icon: HiFolder },
        { path: '/dashboard/my-bids', label: 'My Bids', icon: HiCollection },
        { path: '/dashboard/chat', label: 'Chat', icon: HiChatAlt2 },
        { path: '/dashboard/payments', label: 'Payments', icon: HiCreditCard },
        { path: '/dashboard/notifications', label: 'Notifications', icon: HiBell, badge: unreadCount },
        { path: '/dashboard/settings', label: 'Settings', icon: HiCog },
      ];
    }
    if (user?.role === 'client') {
      return [
        { path: '/dashboard/client', label: 'Dashboard', icon: HiHome },
        { path: '/dashboard/my-projects', label: 'My Projects', icon: HiFolder },
        { path: '/dashboard/create-project', label: 'Create Project', icon: HiPlusCircle },
        { path: '/dashboard/chat', label: 'Chat', icon: HiChatAlt2 },
        { path: '/dashboard/payments', label: 'Payments', icon: HiCreditCard },
        { path: '/dashboard/notifications', label: 'Notifications', icon: HiBell, badge: unreadCount },
        { path: '/dashboard/settings', label: 'Settings', icon: HiCog },
      ];
    }
    if (user?.role === 'admin') {
      return [
        { path: '/dashboard/admin', label: 'Dashboard', icon: HiHome },
        { path: '/dashboard/admin/users', label: 'Users', icon: HiUsers },
        { path: '/dashboard/admin/projects', label: 'Projects', icon: HiFolder },
        { path: '/dashboard/admin/payments', label: 'Payments', icon: HiCreditCard },
        { path: '/dashboard/admin/categories', label: 'Categories', icon: HiCollection },
        { path: '/dashboard/settings', label: 'Settings', icon: HiCog },
      ];
    }
    return [];
  };

  const menuLinks = getLinks();

  const SidebarContent = () => (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200">
      <div>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            StudentBid
          </Link>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Avatar name={user?.fullName} src={user?.avatar?.url} size="md" />
          <div className="overflow-hidden leading-tight">
            <h4 className="font-semibold text-slate-800 truncate text-sm">{user?.fullName}</h4>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {menuLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                </div>
                {!!link.badge && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 text-left"
        >
          <HiLogout className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed top-0 bottom-0 left-0 w-64 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-64 z-40 md:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none md:hidden"
            >
              {mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
            <span className="font-semibold text-slate-800 text-lg hidden md:block">
              {getPageTitle()}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/notifications"
              className="relative text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-slate-50"
            >
              <HiBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </Link>
            <hr className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Avatar name={user?.fullName} src={user?.avatar?.url} size="sm" />
              <span className="text-sm font-medium text-slate-700 hidden lg:block">
                {user?.fullName}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
