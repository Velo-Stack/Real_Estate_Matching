import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { Plus, Trash, PencilSimple, Buildings, MapPin, CurrencyCircleDollar, FileXls, FilePdf } from 'phosphor-react';
import { useAuth } from '../context/AuthContext';
import { canEdit, canDelete, hasRole, ROLES } from '../utils/rbac';

const emptyOffer = {
  type: 'Apartment',
  usage: 'Residential',
  landStatus: 'Freehold',
  city: '',
  district: '',
  areaFrom: '',
  areaTo: '',
  priceFrom: '',
  priceTo: '',
  exclusivity: 'Exclusive',
  description: '',
  coordinates: '',
};

// New Emerald theme input classes
const inputClasses = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]";
const labelClasses = "block mb-2 text-sm font-medium text-slate-300";

const Offers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState(emptyOffer);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data } = await api.get('/offers');
      return data;
    },
  });

  const createOffer = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/offers', payload);
      return data;
    },
    onSuccess: () => {
      toast.success('تم إنشاء العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء إنشاء العرض');
    },
  });

  const updateOffer = useMutation({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put(`/offers/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success('تم تحديث العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث العرض');
    },
  });

  const deleteOffer = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/offers/${id}`);
    },
    onSuccess: () => {
      toast.success('تم حذف العرض بنجاح');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حذف العرض');
    },
  });

  const openCreateModal = () => {
    setEditingOffer(null);
    setFormData(emptyOffer);
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingOffer(offer);
    setFormData({
      type: offer.type || 'Apartment',
      usage: offer.usage || 'Residential',
      landStatus: offer.landStatus || 'Freehold',
      city: offer.city || '',
      district: offer.district || '',
      areaFrom: offer.areaFrom ?? '',
      areaTo: offer.areaTo ?? '',
      priceFrom: offer.priceFrom ?? '',
      priceTo: offer.priceTo ?? '',
      exclusivity: offer.exclusivity || 'Exclusive',
      description: offer.description || '',
      coordinates: offer.coordinates || '',
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

  const isSubmitting = createOffer.isPending || updateOffer.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const areaFromNum = formData.areaFrom ? Number(formData.areaFrom) : null;
    const areaToNum = formData.areaTo ? Number(formData.areaTo) : null;
    const priceFromNum = formData.priceFrom ? Number(formData.priceFrom) : null;
    const priceToNum = formData.priceTo ? Number(formData.priceTo) : null;

    if (areaFromNum !== null && areaToNum !== null && areaFromNum > areaToNum) {
      toast.error('مساحة "من" يجب أن تكون أقل من أو تساوي مساحة "إلى".');
      return;
    }
    if (priceFromNum !== null && priceToNum !== null && priceFromNum > priceToNum) {
      toast.error('سعر "من" يجب أن يكون أقل من أو يساوي سعر "إلى".');
      return;
    }

    const payload = {
      ...formData,
      areaFrom: areaFromNum,
      areaTo: areaToNum,
      priceFrom: priceFromNum,
      priceTo: priceToNum,
    };

    if (editingOffer) {
      updateOffer.mutate({ id: editingOffer.id, payload });
    } else {
      createOffer.mutate(payload);
    }

    setIsModalOpen(false);
  };

  const confirmDelete = (offer) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    deleteOffer.mutate(offer.id);
  };

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/reports/export/pdf?type=offers', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-offers-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير الملف بنجاح');
    } catch (error) {
      toast.error('فشل تصدير الملف');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/reports/export/excel?type=offers', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-offers-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير الملف بنجاح');
    } catch (error) {
      toast.error('فشل تصدير الملف');
    }
  };

  const columns = [
    {
      header: 'النوع',
      key: 'type',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
            <Buildings size={16} className="text-emerald-400" />
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
          <MapPin size={14} className="text-cyan-400" />
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
      header: 'السعر (ج.م)',
      key: 'price',
      render: (row) => (
        <span className="text-cyan-400 font-medium">
          {row.priceFrom ? Number(row.priceFrom).toLocaleString() : '-'} - {row.priceTo ? Number(row.priceTo).toLocaleString() : '-'}
        </span>
      ),
    },
    {
      header: 'الحصرية',
      key: 'exclusivity',
      render: (row) => (
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${row.exclusivity === 'Exclusive'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
          }`}>
          {row.exclusivity === 'Exclusive' ? 'حصري' : 'عام'}
        </span>
      )
    },
  ];

  const actions = (offer) => {
    const canEditOffer = canEdit(offer, user);
    const canDeleteOffer = canDelete(offer, user);

    if (!canEditOffer && !canDeleteOffer) return null;

    return (
      <div className="flex gap-2">
        {canEditOffer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => openEditModal(offer)}
            className="inline-flex items-center gap-1 text-xs rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all duration-300"
          >
            <PencilSimple size={14} />
            تعديل
          </motion.button>
        )}
        {canDeleteOffer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => confirmDelete(offer)}
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
          <p className="text-slate-400 text-sm">إدارة وعرض جميع العروض العقارية المتاحة</p>
        </div>
        <div className="flex items-center gap-3">
          {hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]) && (
            <>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-red-500 to-pink-500 text-white text-sm font-semibold px-5 py-2.5 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300"
              >
                <FilePdf size={20} weight="bold" />
                تصدير PDF
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 text-white text-sm font-semibold px-5 py-2.5 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
          >
            <Plus size={20} weight="bold" />
            إضافة عرض جديد
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={offers} loading={isLoading} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? 'تعديل العرض' : 'إضافة عرض عقاري جديد'}
      >
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
              <label className={labelClasses}>الحصرية</label>
              <select
                name="exclusivity"
                className={inputClasses}
                value={formData.exclusivity}
                onChange={handleChange}
              >
                <option value="Exclusive">حصري</option>
                <option value="Non-Exclusive">عام</option>
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
              <label className={labelClasses}>السعر من (ج.م)</label>
              <input
                name="priceFrom"
                type="number"
                className={inputClasses}
                value={formData.priceFrom}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className={labelClasses}>السعر إلى (ج.م)</label>
              <input
                name="priceTo"
                type="number"
                className={inputClasses}
                value={formData.priceTo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>الوصف</label>
            <textarea
              name="description"
              rows={3}
              className={inputClasses}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={labelClasses}>
              الإحداثيات (خط العرض, خط الطول)
            </label>
            <input
              name="coordinates"
              className={inputClasses}
              value={formData.coordinates}
              onChange={handleChange}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 text-white text-sm font-bold py-3.5 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'جاري الحفظ...'
              : editingOffer
                ? 'تحديث العرض'
                : 'حفظ العرض'}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
