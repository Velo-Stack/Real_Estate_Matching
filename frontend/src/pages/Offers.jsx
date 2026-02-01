import { motion } from 'framer-motion';
import { Buildings, MapPin, FilePdf } from 'phosphor-react';
import { useAuth } from '../context/AuthContext';
import { canEdit, canDelete, hasRole, ROLES } from '../utils/rbac';
import { useCRUD, useFormModal, useExport } from '../hooks';
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
  CONTRACT_TYPE_OPTIONS,
  BROKERS_COUNT_OPTIONS,
} from '../constants/enums';

// البيانات الافتراضية
const emptyOffer = {
  type: 'LAND',
  usage: 'RESIDENTIAL',
  city: '',
  district: '',
  areaFrom: '',
  areaTo: '',
  priceFrom: '',
  priceTo: '',
  purpose: '',
  contractType: '',
  brokersCount: '',
  description: '',
  coordinates: '',
};

// تحويل بيانات العرض للفورم
const mapOfferToForm = (offer) => ({
  type: offer.type || 'LAND',
  usage: offer.usage || 'RESIDENTIAL',
  city: offer.city || '',
  district: offer.district || '',
  areaFrom: offer.areaFrom ?? '',
  areaTo: offer.areaTo ?? '',
  priceFrom: offer.priceFrom ?? '',
  priceTo: offer.priceTo ?? '',
  purpose: offer.purpose || '',
  contractType: offer.contractType || '',
  brokersCount: offer.brokersCount ?? '',
  description: offer.description || '',
  coordinates: offer.coordinates || '',
});

const Offers = () => {
  const { user } = useAuth();

  // CRUD operations
  const {
    data: offers,
    isLoading,
    create,
    update,
    isSubmitting,
  } = useCRUD('offers', {
    messages: {
      createSuccess: 'تم إنشاء العرض بنجاح',
      updateSuccess: 'تم تحديث العرض بنجاح',
      deleteSuccess: 'تم حذف العرض بنجاح',
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
  } = useFormModal(emptyOffer);

  // Export
  const { exportPDF } = useExport('offers');

  // حذف
  const { remove } = useCRUD('offers');
  const confirmDelete = (offer) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
    remove(offer.id);
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const payload = {
      ...formData,
      areaFrom: formData.areaFrom ? Number(formData.areaFrom) : null,
      areaTo: formData.areaTo ? Number(formData.areaTo) : null,
      priceFrom: formData.priceFrom ? Number(formData.priceFrom) : null,
      priceTo: formData.priceTo ? Number(formData.priceTo) : null,
      brokersCount: formData.brokersCount ? Number(formData.brokersCount) : null,
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
      header: 'المساحة',
      key: 'area',
      render: (row) => (
        <span className="text-emerald-400 font-medium">
          {row.areaFrom ?? '-'} - {row.areaTo ?? '-'}
        </span>
      ),
    },
    {
      header: 'السعر',
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
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${row.exclusivity === 'EXCLUSIVE'
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
          : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
          }`}>
          {row.exclusivity === 'EXCLUSIVE' ? 'حصري' : 'عام'}
        </span>
      )
    },
  ];

  // Actions
  const actions = (offer) => {
    const canEditOffer = canEdit(offer, user);
    const canDeleteOffer = canDelete(offer, user);
    if (!canEditOffer && !canDeleteOffer) return null;

    return (
      <ActionButtons
        onEdit={() => openEdit(offer, mapOfferToForm)}
        onDelete={() => confirmDelete(offer)}
        canEdit={canEditOffer}
        canDelete={canDeleteOffer}
      />
    );
  };

  // Header actions
  const headerActions = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER])
    ? [{ label: 'تصدير PDF', icon: FilePdf, onClick: exportPDF, variant: 'danger' }]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        subtitle="إدارة العروض العقارية"
        onAdd={openCreate}
        addLabel="إضافة عرض جديد"
        actions={headerActions}
      />

      <Table columns={columns} data={offers} loading={isLoading} actions={actions} />

      <Modal isOpen={isOpen} onClose={close} title={isEditing ? 'تعديل العرض' : 'إضافة عرض جديد'}>
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

          {/* الغرض + طبيعة التعاقد */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>الغرض</label>
              <select name="purpose" className={inputClasses} value={formData.purpose} onChange={handleChange}>
                <option value="">اختر</option>
                {PURPOSE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClasses}>طبيعة التعاقد</label>
              <select name="contractType" className={inputClasses} value={formData.contractType} onChange={handleChange}>
                <option value="">اختر</option>
                {CONTRACT_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          {/* عدد الوسطاء */}
          <div>
            <label className={labelClasses}>عدد الوسطاء إلى المالك</label>
            <select name="brokersCount" className={inputClasses} value={formData.brokersCount} onChange={handleChange}>
              <option value="">اختر</option>
              {BROKERS_COUNT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
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

          {/* سعر */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>السعر من</label>
              <input name="priceFrom" type="number" className={inputClasses} value={formData.priceFrom} onChange={handleChange} />
            </div>
            <div>
              <label className={labelClasses}>السعر إلى</label>
              <input name="priceTo" type="number" className={inputClasses} value={formData.priceTo} onChange={handleChange} />
            </div>
          </div>

          {/* وصف */}
          <div>
            <label className={labelClasses}>الوصف</label>
            <textarea name="description" rows={3} className={inputClasses} value={formData.description} onChange={handleChange} />
          </div>

          {/* إحداثيات */}
          <div>
            <label className={labelClasses}>الإحداثيات</label>
            <input name="coordinates" className={inputClasses} value={formData.coordinates} onChange={handleChange} />
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

export default Offers;
