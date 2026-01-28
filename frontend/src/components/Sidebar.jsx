import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  SquaresFour,
  Buildings,
  MagnifyingGlass,
  Handshake,
  Users,
  Bell,
  Scroll,
  FileArrowDown,
  SignOut,
  CaretLeft,
} from 'phosphor-react';
import { hasRole, ROLES } from '../utils/rbac';

const Sidebar = ({ collapsed }) => {
  const { user, logout } = useAuth();

  const canSeeAudit = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
  const canSeeReports = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);

  const navLinkClasses = ({ isActive }) => {
    const base = 'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300';

    if (isActive) {
      return `${base} bg-gradient-to-l from-emerald-500/20 to-cyan-500/10 text-emerald-400 border-r-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]`;
    }
    return `${base} text-slate-400 hover:text-white hover:bg-white/5 border-r-2 border-transparent`;
  };

  const NavIcon = ({ children, isActive }) => (
    <span className={`text-xl shrink-0 transition-all duration-300 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`}>
      {children}
    </span>
  );

  const linkItems = [
    { to: '/', icon: SquaresFour, label: 'لوحة التحكم', show: true },
    { to: '/offers', icon: Buildings, label: 'العروض العقارية', show: true },
    { to: '/requests', icon: MagnifyingGlass, label: 'طلبات العملاء', show: true },
    { to: '/matches', icon: Handshake, label: 'التطابقات الذكية', show: true },
    { to: '/notifications', icon: Bell, label: 'التنبيهات', show: true },
    { to: '/users', icon: Users, label: 'المستخدمين', show: user?.role === 'ADMIN' },
    { to: '/audit-logs', icon: Scroll, label: 'سجلات التدقيق', show: canSeeAudit },
    { to: '/reports', icon: FileArrowDown, label: 'التقارير', show: canSeeReports },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-screen sticky top-0 flex flex-col bg-[#0d1117]/95 backdrop-blur-xl border-l border-white/5"
    >
      {/* Decorative gradient line */}
      <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-gradient-to-b from-emerald-500/50 via-cyan-500/30 to-transparent" />

      {/* Logo Section */}
      <div className="px-4 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            className="relative"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Buildings size={24} weight="duotone" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 blur-xl opacity-40" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-lg font-bold bg-gradient-to-l from-emerald-400 to-cyan-400 bg-clip-text text-transparent m-0">
                  عقارات ماتش
                </h1>
                <p className="text-[11px] text-slate-500 m-0">نظام المطابقة العقاري</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {linkItems.filter(item => item.show).map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClasses}>
            {({ isActive }) => (
              <>
                <NavIcon isActive={isActive}>
                  <item.icon weight="duotone" />
                </NavIcon>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d1117]" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <h4 className="text-sm font-semibold text-white m-0 truncate">{user?.name}</h4>
                <p className="text-[11px] text-emerald-400/70 m-0">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/80 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all duration-300"
          type="button"
        >
          <SignOut weight="duotone" className="text-lg" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                تسجيل خروج
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
