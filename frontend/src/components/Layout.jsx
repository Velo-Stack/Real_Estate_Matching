import { useEffect, useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, List, X } from 'phosphor-react';
import Sidebar from './Sidebar';
import api from '../utils/api';

const Layout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const stored = localStorage.getItem('sidebarCollapsed');
    if (stored === 'true') setSidebarCollapsed(true);
  }, []);

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    // على الموبايل: فتح/إغلاق القائمة
    if (window.innerWidth < 1024) {
      setMobileMenuOpen(prev => !prev);
    } else {
      // على الديسكتوب: تصغير/تكبير
      setSidebarCollapsed(prev => {
        const next = !prev;
        localStorage.setItem('sidebarCollapsed', String(next));
        return next;
      });
    }
  };

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

  const pageInfo = {
    '/': { title: 'لوحة التحكم', subtitle: 'نظرة عامة على النظام' },
    '/offers': { title: 'إدارة العروض', subtitle: 'عرض وإدارة العقارات' },
    '/requests': { title: 'طلبات العملاء', subtitle: 'إدارة طلبات البحث' },
    '/matches': { title: 'التطابقات', subtitle: 'المطابقات الذكية' },
    '/notifications': { title: 'التنبيهات', subtitle: 'إشعارات النظام' },
    '/users': { title: 'إدارة المستخدمين', subtitle: 'إدارة الصلاحيات' },
    '/audit-logs': { title: 'سجلات التدقيق', subtitle: 'تتبع العمليات' },
    '/reports': { title: 'التقارير والتصدير', subtitle: 'تصدير البيانات' },
    '/teams': { title: 'إدارة الفرق', subtitle: 'فرق العمل' },
    '/chat': { title: 'المحادثات', subtitle: 'التواصل الداخلي' },
  };

  const currentPage = pageInfo[location.pathname] || { title: '', subtitle: '' };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full z-50 lg:hidden"
            >
              <Sidebar collapsed={false} onClose={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 lg:h-20 bg-[#0d1117]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3 lg:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={toggleSidebar}
              aria-label="تبديل القائمة الجانبية"
              className="h-9 w-9 lg:h-10 lg:w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-emerald-500/30 transition-all duration-300"
            >
              <List size={20} weight="bold" />
            </motion.button>

            <div>
              <h2 className="text-base lg:text-xl font-bold text-white m-0">
                {currentPage.title}
              </h2>
              <p className="text-[10px] lg:text-xs text-slate-500 m-0 hidden sm:block">{currentPage.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            {/* Notifications */}
            <Link to="/notifications">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-9 w-9 lg:h-10 lg:w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -left-1 min-w-[18px] h-[18px] lg:min-w-[20px] lg:h-5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[9px] lg:text-[10px] font-bold flex items-center justify-center px-1 shadow-lg shadow-emerald-500/30"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <section className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default Layout;
