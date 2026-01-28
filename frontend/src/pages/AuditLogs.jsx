import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { Scroll, Funnel, Calendar, UserCircle, ArrowsClockwise, Plus, Trash, PencilSimple } from 'phosphor-react';

const inputClasses = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]";
const labelClasses = "block mb-2 text-xs font-medium text-slate-400";

const actionConfig = {
  CREATE: { label: 'إنشاء', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Plus },
  UPDATE: { label: 'تحديث', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: PencilSimple },
  DELETE: { label: 'حذف', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: Trash },
};

const AuditLogs = () => {
  const [filters, setFilters] = useState({
    resource: '',
    action: '',
    userId: '',
    startDate: '',
    endDate: '',
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      const params = {};
      if (filters.resource) params.resource = filters.resource;
      if (filters.action) params.action = filters.action;
      if (filters.userId) params.userId = Number(filters.userId);
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await api.get('/audit-logs', { params });
      return data;
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      resource: '',
      action: '',
      userId: '',
      startDate: '',
      endDate: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
          <Scroll size={24} className="text-violet-400" weight="duotone" />
        </div>
        <div>
          <p className="text-white font-semibold">سجلات التدقيق</p>
          <p className="text-sm text-slate-500">تتبع جميع العمليات والتغييرات في النظام</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Funnel size={16} className="text-slate-500" />
          <span className="text-sm text-slate-400">تصفية النتائج</span>
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="mr-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <ArrowsClockwise size={14} />
              مسح الفلاتر
            </motion.button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-right">
          <div>
            <label className={labelClasses}>المورد</label>
            <input
              name="resource"
              className={inputClasses}
              value={filters.resource}
              onChange={handleChange}
              placeholder="Offer, Request, User..."
            />
          </div>
          <div>
            <label className={labelClasses}>الإجراء</label>
            <select
              name="action"
              className={inputClasses}
              value={filters.action}
              onChange={handleChange}
            >
              <option value="">الكل</option>
              <option value="CREATE">إنشاء</option>
              <option value="UPDATE">تحديث</option>
              <option value="DELETE">حذف</option>
            </select>
          </div>
          <div>
            <label className={labelClasses}>معرّف المستخدم</label>
            <input
              name="userId"
              type="number"
              className={inputClasses}
              value={filters.userId}
              onChange={handleChange}
              placeholder="مثال: 1"
            />
          </div>
          <div>
            <label className={labelClasses}>من تاريخ</label>
            <input
              name="startDate"
              type="date"
              className={inputClasses}
              value={filters.startDate}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className={labelClasses}>إلى تاريخ</label>
            <input
              name="endDate"
              type="date"
              className={inputClasses}
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">جاري تحميل السجلات...</span>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
            <Scroll size={32} className="text-slate-500" />
          </div>
          <p className="text-slate-400 text-sm">لا توجد سجلات مطابقة للفلاتر الحالية</p>
        </div>
      ) : (
        <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
          <AnimatePresence>
            {logs.map((log, index) => {
              const actionCfg = actionConfig[log.action] || actionConfig.UPDATE;
              const ActionIcon = actionCfg.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Action Icon */}
                    <div className={`h-10 w-10 rounded-xl shrink-0 flex items-center justify-center ${actionCfg.bg} border ${actionCfg.border}`}>
                      <ActionIcon size={18} className={actionCfg.text} weight="duotone" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${actionCfg.bg} ${actionCfg.text} border ${actionCfg.border}`}>
                          {actionCfg.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {log.resource}
                        </span>
                        {log.resourceId && (
                          <span className="text-xs text-slate-500">#{log.resourceId}</span>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <UserCircle size={14} />
                          {log.user?.name || 'مستخدم'} ({log.userId})
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(log.createdAt).toLocaleString('ar-EG')}
                        </span>
                      </div>

                      {/* Changes */}
                      {log.changes && (
                        <div className="mt-3">
                          <pre className="text-[11px] text-slate-400 bg-[#0d1117] rounded-lg p-3 border border-white/5 overflow-x-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
