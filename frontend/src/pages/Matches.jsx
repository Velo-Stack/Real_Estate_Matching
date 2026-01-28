import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Table from '../components/Table';
import { useAuth } from '../context/AuthContext';
import { hasRole, ROLES } from '../utils/rbac';
import { Handshake, Buildings, Target, TrendUp, Funnel } from 'phosphor-react';

// Status config with new theme colors
const statusConfig = {
  NEW: { label: 'جديد', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', dot: 'bg-violet-400' },
  CONTACTED: { label: 'تم التواصل', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  NEGOTIATION: { label: 'تفاوض', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  CLOSED: { label: 'تم الإغلاق', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  REJECTED: { label: 'مرفوض', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },
};

const selectClasses = "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]";

const Matches = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data } = await api.get('/matches');
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.patch(`/matches/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة المطابقة');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث حالة المطابقة');
    },
  });

  const filteredMatches =
    statusFilter === 'ALL'
      ? matches
      : matches.filter((m) => m.status === statusFilter);

  const renderStatus = (status) => {
    const cfg = statusConfig[status] || statusConfig.NEW;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const renderScore = (score) => {
    const color = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-full rounded-full ${score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : score >= 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
          />
        </div>
        <span className={`text-sm font-bold ${color}`}>{score}%</span>
      </div>
    );
  };

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
      render: (row) => renderStatus(row.status),
    },
  ];

  const canUpdateStatus = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER, ROLES.BROKER]);

  const actions = (row) =>
    canUpdateStatus ? (
      <select
        value={row.status}
        disabled={updateStatusMutation.isPending}
        onChange={(e) =>
          updateStatusMutation.mutate({ id: row.id, status: e.target.value })
        }
        className={selectClasses}
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827]/60 backdrop-blur-xl rounded-xl border border-white/5 p-4 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <Handshake size={22} className="text-white" weight="duotone" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-500">إجمالي المطابقات</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111827]/60 backdrop-blur-xl rounded-xl border border-white/5 p-4 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{stats.new}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.new}</p>
            <p className="text-xs text-slate-500">مطابقات جديدة</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827]/60 backdrop-blur-xl rounded-xl border border-white/5 p-4 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{stats.closed}</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.closed}</p>
            <p className="text-xs text-slate-500">صفقات مغلقة</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111827]/60 backdrop-blur-xl rounded-xl border border-white/5 p-4 flex items-center gap-4"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <TrendUp size={22} className="text-white" weight="duotone" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
            <p className="text-xs text-slate-500">معدل التوافق</p>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          عرض <span className="text-white font-semibold">{filteredMatches.length}</span> من أصل {matches.length} مطابقة
        </p>
        <div className="flex items-center gap-3">
          <Funnel size={18} className="text-slate-500" />
          <select
            className={selectClasses}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
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
      <Table columns={columns} data={filteredMatches} loading={isLoading} />
    </div>
  );
};

export default Matches;
