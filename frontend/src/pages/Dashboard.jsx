import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendUp, TrendDown, Buildings, Users, Handshake, Target, ArrowUp, ArrowDown } from 'phosphor-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { hasRole, ROLES } from '../utils/rbac';

// Chart Colors
const COLORS = {
  emerald: '#10b981',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  pink: '#ec4899',
  blue: '#3b82f6',
};

const PIE_COLORS = [COLORS.emerald, COLORS.cyan, COLORS.violet, COLORS.amber, COLORS.pink];

// Stat Card with icon and trend
const StatCard = ({ label, value, icon: Icon, trend, trendValue, delay = 0, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative overflow-hidden bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 group cursor-pointer"
  >
    {/* Background Gradient */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

    {/* Icon */}
    <div className="relative flex items-start justify-between mb-4">
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
        <Icon size={24} weight="duotone" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
          {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          {trendValue}%
        </div>
      )}
    </div>

    <h3 className="relative text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="relative text-sm text-slate-400">{label}</p>
  </motion.div>
);

// Chart Card Wrapper
const ChartCard = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </motion.div>
);

// Custom Tooltip for all charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a2235] border border-white/10 rounded-xl px-4 py-3 shadow-xl backdrop-blur-xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Quick Action Card
const QuickAction = ({ icon: Icon, title, subtitle, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="flex items-center gap-4 bg-[#111827]/40 hover:bg-[#111827]/60 border border-white/5 hover:border-white/10 rounded-xl p-4 text-right transition-all duration-300 w-full"
  >
    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
      <Icon size={20} weight="duotone" className="text-white" />
    </div>
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </motion.button>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary');
      return data;
    },
  });

  const { data: topBrokers = [], isLoading: brokersLoading } = useQuery({
    queryKey: ['dashboard', 'top-brokers'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/top-brokers');
      return data;
    },
    enabled: hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]),
  });

  const { data: topAreas = [], isLoading: areasLoading } = useQuery({
    queryKey: ['dashboard', 'top-areas'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/top-areas');
      return data;
    },
  });

  const loading = summaryLoading || brokersLoading || areasLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">
          مرحباً، {user?.name} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          إليك نظرة عامة على أداء النظام اليوم
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي العروض"
          value={summary?.offers ?? (loading ? '...' : 0)}
          icon={Buildings}
          gradient="from-emerald-500 to-emerald-600"
          delay={0}
        />
        <StatCard
          label="إجمالي الطلبات"
          value={summary?.requests ?? (loading ? '...' : 0)}
          icon={Target}
          gradient="from-cyan-500 to-cyan-600"
          delay={0.1}
        />
        <StatCard
          label="إجمالي المطابقات"
          value={summary?.matches ?? (loading ? '...' : 0)}
          icon={Handshake}
          gradient="from-violet-500 to-violet-600"
          delay={0.2}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <ChartCard
          title="إجراءات سريعة"
          subtitle="الوصول السريع للأقسام الرئيسية"
          delay={0.4}
        >
          <div className="space-y-3">
            <QuickAction
              icon={Buildings}
              title="إضافة عرض جديد"
              subtitle="إضافة عقار للعرض"
              color="from-emerald-500 to-emerald-600"
            />
            <QuickAction
              icon={Target}
              title="طلب عميل جديد"
              subtitle="تسجيل طلب بحث"
              color="from-cyan-500 to-cyan-600"
            />
            <QuickAction
              icon={Handshake}
              title="عرض المطابقات"
              subtitle="التطابقات المحتملة"
              color="from-violet-500 to-violet-600"
            />
            <QuickAction
              icon={Users}
              title="إدارة الفريق"
              subtitle="إدارة المستخدمين"
              color="from-amber-500 to-amber-600"
            />
          </div>
        </ChartCard>

        {/* Top Brokers Bar Chart */}
        {hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]) && (
          <ChartCard title="أفضل السماسرة" subtitle="حسب عدد الصفقات المنجزة" delay={0.5}>
            {brokersLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            ) : topBrokers.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                لا توجد بيانات للسماسرة
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBrokers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      name="الصفقات"
                      fill={COLORS.emerald}
                      radius={[0, 8, 8, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        )}

        {/* Top Areas Bar Chart */}
        <ChartCard title="أفضل المناطق" subtitle="حسب عدد العروض المتاحة" delay={0.6}>
          {areasLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : topAreas.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              لا توجد بيانات للمناطق
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topAreas.map((area) => ({
                  city: area.city,
                  count: area._count?.id ?? 0,
                }))}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={1} />
                      <stop offset="100%" stopColor={COLORS.emerald} stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="city"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="العروض"
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;
