import { motion } from 'framer-motion';
import { Target, MapPin, Flag } from 'phosphor-react';
import { useAuth } from '../context/AuthContext';
import { canEdit, canDelete } from '../utils/rbac';
import { useCRUD, useFormModal } from '../hooks';
import { PageHeader, ActionButtons, CityDistrictSelect } from '../components/common';
import Table from '../components/Table';
import Modal from '../components/Modal';
import {
  inputClasses,
  labelClasses,
  submitButtonClasses,
} from '../constants/styles';
import {
  PROPERTY_TYPE_OPTIONS,
  USAGE_TYPE_OPTIONS,
  PURPOSE_OPTIONS,
  PRIORITY_OPTIONS,
} from '../constants/enums';

// البيانات الافتراضية
const emptyRequest = {
  type: 'LAND',
  usage: 'RESIDENTIAL',
  city: '',
  district: '',
  areaFrom: '',
  areaTo: '',
  budgetFrom: '',
  budgetTo: '',
  purpose: '',
  priority: 'MEDIUM',
};

// تحويل للفورم
const mapRequestToForm = (req) => ({
  type: req.type || 'LAND',
  usage: req.usage || 'RESIDENTIAL',
  city: req.city || '',
  district: req.district || '',
  areaFrom: req.areaFrom ?? '',
  areaTo: req.areaTo ?? '',
  budgetFrom: req.budgetFrom ?? '',
  budgetTo: req.budgetTo ?? '',
  purpose: req.purpose || '',
  priority: req.priority || 'MEDIUM',
});

// Priority config
const priorityConfig = {
  HIGH: { label: 'مرتفعة', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  MEDIUM: { label: 'متوسطة', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  LOW: { label: 'منخفضة', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const Requests = () => {
  const { user } = useAuth();

  // CRUD
  const {
    data: requests,
    isLoading,
    create,
    update,
    remove,
    isSubmitting,
  } = useCRUD('requests', {
    messages: {
      createSuccess: 'تم إنشاء الطلب بنجاح',
      updateSuccess: 'تم تحديث الطلب بنجاح',
      deleteSuccess: 'تم حذف الطلب بنجاح',
    },
  });

  // Form & Modal
  const {
    isOpen,
    formData,
    editingItem,
    isEditing,
    openCreate,
    openEdit,
    close,
    handleChange,
  } = useFormModal(emptyRequest);

  // حذف
  const confirmDelete = (req) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    remove(req.id);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const payload = {
      ...formData,
      areaFrom: formData.areaFrom ? Number(formData.areaFrom) : null,
      areaTo: formData.areaTo ? Number(formData.areaTo) : null,
      budgetFrom: formData.budgetFrom ? Number(formData.budgetFrom) : null,
      budgetTo: formData.budgetTo ? Number(formData.budgetTo) : null,
    };

    if (isEditing) {
      update({ id: editingItem.id, payload });
    } else {
      create(payload);
    }
    close();
  };

  // أعمدة الجدول
  const columns = [
    {
      header: 'النوع',
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
      header: 'المساحة',
      key: 'area',
      render: (row) => (
        <span className="text-emerald-400 font-medium">
          {row.areaFrom ?? '-'} - {row.areaTo ?? '-'}
        </span>
      ),
    },
    {
      header: 'الميزانية',
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
        const cfg = priorityConfig[row.priority] || priorityConfig.MEDIUM;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
            <Flag size={12} weight="fill" />
            {cfg.label}
          </span>
        );
      }
    },
  ];

  // Actions
  const actions = (req) => {
    const canEditReq = canEdit(req, user);
    const canDeleteReq = canDelete(req, user);
    if (!canEditReq && !canDeleteReq) return null;

    return (
      <ActionButtons
        onEdit={() => openEdit(req, mapRequestToForm)}
        onDelete={() => confirmDelete(req)}
        canEdit={canEditReq}
        canDelete={canDeleteReq}
      />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="إدارة طلبات العملاء"
        onAdd={openCreate}
        addLabel="إضافة طلب جديد"
      />

      <Table columns={columns} data={requests} loading={isLoading} actions={actions} />

      <Modal isOpen={isOpen} onClose={close} title={isEditing ? 'تعديل الطلب' : 'إضافة طلب جديد'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-right">
          {/* نوع + استخدام */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>نوع العقار</label>
              <select name="type" className={inputClasses} value={formData.type} onChange={handleChange} required>
                {PROPERTY_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>الاستخدام</label>
              <select name="usage" className={inputClasses} value={formData.usage} onChange={handleChange} required>
                {USAGE_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* الغرض + الأولوية */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>الغرض</label>
              <select name="purpose" className={inputClasses} value={formData.purpose} onChange={handleChange}>
                <option value="">اختر</option>
                {PURPOSE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>الأولوية</label>
              <select name="priority" className={inputClasses} value={formData.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* مدينة + حي */}
          <CityDistrictSelect
            cityValue={formData.city}
            districtValue={formData.district}
            onCityChange={handleChange}
            onDistrictChange={handleChange}
            required
          />

          {/* مساحة */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>المساحة من</label>
              <input name="areaFrom" type="number" className={inputClasses} value={formData.areaFrom} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClasses}>المساحة إلى</label>
              <input name="areaTo" type="number" className={inputClasses} value={formData.areaTo} onChange={handleChange} />
            </div>
          </div>

          {/* ميزانية */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>الميزانية من</label>
              <input name="budgetFrom" type="number" className={inputClasses} value={formData.budgetFrom} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClasses}>الميزانية إلى</label>
              <input name="budgetTo" type="number" className={inputClasses} value={formData.budgetTo} onChange={handleChange} />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSubmitting}
            className={submitButtonClasses}
          >
            {isSubmitting ? 'جاري الحفظ...' : isEditing ? 'تحديث' : 'حفظ'}
          </motion.button>
        </form>
      </Modal>
    </div>
  );
};

export default Requests;
