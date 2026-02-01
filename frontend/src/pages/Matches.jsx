import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { hasRole, ROLES } from '../utils/rbac';
import { useCRUD } from '../hooks';
import { MiniStatCard, StatusBadge, STATUS_CONFIGS } from '../components/common';
import Table from '../components/Table';
import { Handshake, Buildings, Target, TrendUp, Funnel } from 'phosphor-react';
import { inputClasses } from '../constants/styles';

const Matches = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('ALL');

  // CRUD
  const { data: matches, isLoading, updateStatus } = useCRUD('matches');

  const filteredMatches =
    statusFilter === 'ALL'
      ? matches
      : matches.filter((m) => m.status === statusFilter);

  // Score render
  const renderScore = (score) => {
    const color = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
    const gradient = score >= 80
      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500'
      : score >= 50
        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
        : 'bg-gradient-to-r from-red-500 to-pink-500';

    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-full rounded-full ${gradient}`}
          />
        </div>
        <span className={`text-sm font-bold ${color}`}>{score}%</span>
      </div>
    );
  };

  // Columns
  const columns = [
    {
      header: 'العرض',
      key: 'offer',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
            <Buildings size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">{row.offer?.type || 'غير محدد'}</p>
            <p className="text-xs text-slate-500">{row.offer?.city} - {row.offer?.priceFrom ? Number(row.offer.priceFrom).toLocaleString() + ' ج.م' : ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'الطلب',
      key: 'request',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
            <Target size={18} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-white font-medium">{row.request?.type || 'غير محدد'}</p>
            <p className="text-xs text-slate-500">{row.request?.city} - {row.request?.budgetFrom ? Number(row.request.budgetFrom).toLocaleString() + ' ج.م' : ''}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'نسبة التوافق',
      key: 'score',
      render: (row) => renderScore(row.score),
    },
    {
      header: 'الحالة',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} config={STATUS_CONFIGS[row.status]} />,
    },
  ];

  const canUpdateStatus = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]);

  // Actions
  const actions = (row) =>
    canUpdateStatus ? (
      <select
        value={row.status}
        onChange={(e) => updateStatus({ id: row.id, status: e.target.value })}
        className={inputClasses}
      >
        <option value="NEW">جديد</option>
        <option value="CONTACTED">تم التواصل</option>
        <option value="NEGOTIATION">تفاوض</option>
        <option value="CLOSED">إغلاق صفقة</option>
        <option value="REJECTED">رفض</option>
      </select>
    ) : null;

  // Stats
  const stats = {
    total: matches.length,
    new: matches.filter(m => m.status === 'NEW').length,
    closed: matches.filter(m => m.status === 'CLOSED').length,
    avgScore: matches.length > 0 ? Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length) : 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MiniStatCard label="إجمالي المطابقات" value={stats.total} icon={Handshake} gradient="violet" />
        <MiniStatCard label="مطابقات جديدة" value={stats.new} icon={Target} gradient="cyan" delay={0.1} />
        <MiniStatCard label="صفقات مغلقة" value={stats.closed} icon={Buildings} gradient="emerald" delay={0.2} />
        <MiniStatCard label="معدل التوافق" value={`${stats.avgScore}%`} icon={TrendUp} gradient="amber" delay={0.3} />
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          عرض <span className="text-white font-semibold">{filteredMatches.length}</span> من أصل {matches.length} مطابقة
        </p>
        <div className="flex items-center gap-3">
          <Funnel size={18} className="text-slate-500" />
          <select className={inputClasses} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">جميع الحالات</option>
            <option value="NEW">جديد</option>
            <option value="CONTACTED">تم التواصل</option>
            <option value="NEGOTIATION">تفاوض</option>
            <option value="CLOSED">تم الإغلاق</option>
            <option value="REJECTED">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredMatches} loading={isLoading} actions={actions} />
    </div>
  );
};

export default Matches;
