import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Trash, PencilSimple, Target, MapPin, Wallet, Flag } from 'phosphor-react';
import { useAuth } from '../context/AuthContext';
import { canEdit, canDelete } from '../utils/rbac';

const emptyRequest = {
  type: 'Apartment',
  usage: 'Residential',
  landStatus: 'Freehold',
  city: '',
  district: '',
  areaFrom: '',
  areaTo: '',
  budgetFrom: '',
  budgetTo: '',
  priority: 'Medium',
};

// New Emerald theme input classes
const inputClasses = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]";
const labelClasses = "block mb-2 text-sm font-medium text-slate-300";

const priorityConfig = {
  High: { label: 'مرتفعة', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  Medium: { label: 'متوسطة', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  Low: { label: 'منخفضة', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const Requests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [formData, setFormData] = useState(emptyRequest);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests');
      return data;
    },
  });

  const createRequest = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/requests', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('تم إنشاء الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إنشاء الطلب');
    },
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/requests/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success('تم تحديث الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الطلب');
    },
  });

  const deleteRequest = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/requests/${id}`);
    },
    onSuccess: () => {
      toast.success('تم حذف الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حذف الطلب');
    },
  });

  const openCreateModal = () => {
    setEditingRequest(null);
    setFormData(emptyRequest);
    setIsModalOpen(true);
  };

  const openEditModal = (request) => {
    setEditingRequest(request);
    setFormData({
      type: request.type || 'Apartment',
      usage: request.usage || 'Residential',
      landStatus: request.landStatus || 'Freehold',
      city: request.city || '',
      district: request.district || '',
      areaFrom: request.areaFrom ?? '',
      areaTo: request.areaTo ?? '',
      budgetFrom: request.budgetFrom ?? '',
      budgetTo: request.budgetTo ?? '',
      priority: request.priority || 'Medium',
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isSubmitting = createRequest.isPending || updateRequest.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const areaFromNum = formData.areaFrom ? Number(formData.areaFrom) : null;
    const areaToNum = formData.areaTo ? Number(formData.areaTo) : null;
    const budgetFromNum = formData.budgetFrom ? Number(formData.budgetFrom) : null;
    const budgetToNum = formData.budgetTo ? Number(formData.budgetTo) : null;

    if (areaFromNum !== null && areaToNum !== null && areaFromNum > areaToNum) {
      toast.error('مساحة "من" يجب أن تكون أقل من أو تساوي مساحة "إلى".');
      return;
    }
    if (budgetFromNum !== null && budgetToNum !== null && budgetFromNum > budgetToNum) {
      toast.error('الميزانية "من" يجب أن تكون أقل من أو تساوي الميزانية "إلى".');
      return;
    }

    const payload = {
      ...formData,
      areaFrom: areaFromNum,
      areaTo: areaToNum,
      budgetFrom: budgetFromNum,
      budgetTo: budgetToNum,
    };

    if (editingRequest) {
      updateRequest.mutate({ id: editingRequest.id, payload });
    } else {
      createRequest.mutate(payload);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = (request) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    deleteRequest.mutate(request.id);
  };

  const columns = [
    {
      header: 'نوع العقار',
      key: 'type',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
            <Target size={16} className="text-cyan-400" />
          </div>
          <span>{row.type}</span>
        </div>
      )
    },
    { header: 'الاستخدام', key: 'usage' },
    {
      header: 'الموقع',
      key: 'location',
      render: (row) => (
        <div className="flex items-center gap-1 text-slate-400">
          <MapPin size={14} className="text-emerald-400" />
          <span>{row.city} - {row.district}</span>
        </div>
      )
    },
    {
      header: 'المساحة (م²)',
      key: 'area',
      render: (row) => (
        <span className="text-emerald-400 font-medium">
          {row.areaFrom ?? '-'} - {row.areaTo ?? '-'}
        </span>
      ),
    },
    {
      header: 'الميزانية (ج.م)',
      key: 'budget',
      render: (row) => (
        <span className="text-cyan-400 font-medium">
          {row.budgetFrom ? Number(row.budgetFrom).toLocaleString() : '-'} - {row.budgetTo ? Number(row.budgetTo).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      header: 'الأولوية',
      key: 'priority',
      render: (row) => {
        const config = priorityConfig[row.priority] || priorityConfig.Medium;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}>
            <Flag size={12} weight="fill" />
            {config.label}
          </span>
        );
      }
    },
  ];

  const actions = (request) => {
    const canEditRequest = canEdit(request, user);
    const canDeleteRequest = canDelete(request, user);

    if (!canEditRequest && !canDeleteRequest) return null;

    return (
      <div className="flex gap-2">
        {canEditRequest && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => openEditModal(request)}
            className="inline-flex items-center gap-1 text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition-all duration-300"
          >
            <PencilSimple size={14} />
            تعديل
          </motion.button>
        )}
        {canDeleteRequest && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => confirmDelete(request)}
            className="inline-flex items-center gap-1 text-xs rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-300"
          >
            <Trash size={14} />
            حذف
          </motion.button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">إدارة وعرض جميع طلبات العملاء للبحث عن عقارات</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-emerald-500 text-white text-sm font-semibold px-5 py-2.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
        >
          <Plus size={20} weight="bold" />
          إضافة طلب جديد
        </motion.button>
      </div>

      {/* Table */}
      <Table columns={columns} data={requests} loading={isLoading} />

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRequest ? 'تعديل الطلب' : 'إضافة طلب عميل جديد'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-right">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>نوع العقار</label>
              <input
                name="type"
                className={inputClasses}
                value={formData.type}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>الاستخدام</label>
              <input
                name="usage"
                className={inputClasses}
                value={formData.usage}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>حالة الأرض</label>
              <input
                name="landStatus"
                className={inputClasses}
                value={formData.landStatus}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>الأولوية</label>
              <select
                name="priority"
                className={inputClasses}
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="High">مرتفعة</option>
                <option value="Medium">متوسطة</option>
                <option value="Low">منخفضة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>المدينة</label>
              <input
                name="city"
                className={inputClasses}
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className={labelClasses}>الحي</label>
              <input
                name="district"
                className={inputClasses}
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>المساحة من (م²)</label>
              <input
                name="areaFrom"
                type="number"
                className={inputClasses}
                value={formData.areaFrom}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClasses}>المساحة إلى (م²)</label>
              <input
                name="areaTo"
                type="number"
                className={inputClasses}
                value={formData.areaTo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>الميزانية من (ج.م)</label>
              <input
                name="budgetFrom"
                type="number"
                className={inputClasses}
                value={formData.budgetFrom}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClasses}>الميزانية إلى (ج.م)</label>
              <input
                name="budgetTo"
                type="number"
                className={inputClasses}
                value={formData.budgetTo}
                onChange={handleChange}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-l from-cyan-500 to-emerald-500 text-white text-sm font-bold py-3.5 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'جاري الحفظ...'
              : editingRequest
                ? 'تحديث الطلب'
                : 'حفظ الطلب'}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
};

export default Requests;
