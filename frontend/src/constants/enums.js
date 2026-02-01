/**
 * ملف القيم الثابتة (Enums)
 * متزامن مع الـ Backend Prisma Schema
 */

// =====================
// أنواع العقارات - PropertyType
// =====================
export const PROPERTY_TYPES = {
    LAND: { value: 'LAND', label: 'أرض' },
    PROJECT: { value: 'PROJECT', label: 'مشروع' },
    PLAN: { value: 'PLAN', label: 'مخطط' },
};

export const PROPERTY_TYPE_OPTIONS = Object.values(PROPERTY_TYPES);

// =====================
// نوع الاستخدام - UsageType
// =====================
export const USAGE_TYPES = {
    RESIDENTIAL: { value: 'RESIDENTIAL', label: 'سكني' },
    COMMERCIAL: { value: 'COMMERCIAL', label: 'تجاري' },
    ADMINISTRATIVE: { value: 'ADMINISTRATIVE', label: 'إداري' },
    INDUSTRIAL: { value: 'INDUSTRIAL', label: 'صناعي' },
    AGRICULTURAL: { value: 'AGRICULTURAL', label: 'زراعي' },
};

export const USAGE_TYPE_OPTIONS = Object.values(USAGE_TYPES);

// =====================
// حالة الأرض - LandStatus
// =====================
export const LAND_STATUSES = {
    RAW: { value: 'RAW', label: 'خام' },
    DEVELOPED: { value: 'DEVELOPED', label: 'مطورة' },
};

export const LAND_STATUS_OPTIONS = Object.values(LAND_STATUSES);

// =====================
// الحصرية - ExclusivityType
// =====================
export const EXCLUSIVITY_TYPES = {
    EXCLUSIVE: { value: 'EXCLUSIVE', label: 'حصري' },
    NON_EXCLUSIVE: { value: 'NON_EXCLUSIVE', label: 'غير حصري' },
};

export const EXCLUSIVITY_OPTIONS = Object.values(EXCLUSIVITY_TYPES);

// =====================
// الغرض من العرض - PurposeType
// =====================
export const PURPOSE_TYPES = {
    SALE: { value: 'SALE', label: 'بيع' },
    RENT: { value: 'RENT', label: 'إيجار' },
    PARTNERSHIP: { value: 'PARTNERSHIP', label: 'مشاركة' },
    INVESTMENT: { value: 'INVESTMENT', label: 'استثمار' },
};

export const PURPOSE_OPTIONS = Object.values(PURPOSE_TYPES);

// =====================
// طبيعة التعاقد - ContractType
// =====================
export const CONTRACT_TYPES = {
    WITH_MEDIATION_CONTRACT: { value: 'WITH_MEDIATION_CONTRACT', label: 'عام بعقد وساطة' },
    WITHOUT_MEDIATION_CONTRACT: { value: 'WITHOUT_MEDIATION_CONTRACT', label: 'عام بدون عقد وساطة' },
};

export const CONTRACT_TYPE_OPTIONS = Object.values(CONTRACT_TYPES);

// =====================
// الأولوية - PriorityType
// =====================
export const PRIORITY_TYPES = {
    HIGH: { value: 'HIGH', label: 'مرتفعة', color: 'red' },
    MEDIUM: { value: 'MEDIUM', label: 'متوسطة', color: 'amber' },
    LOW: { value: 'LOW', label: 'منخفضة', color: 'slate' },
};

export const PRIORITY_OPTIONS = Object.values(PRIORITY_TYPES);

// =====================
// حالة المطابقة - MatchStatus
// =====================
export const MATCH_STATUSES = {
    NEW: { value: 'NEW', label: 'جديد', color: 'violet' },
    CONTACTED: { value: 'CONTACTED', label: 'تم التواصل', color: 'cyan' },
    NEGOTIATION: { value: 'NEGOTIATION', label: 'تفاوض', color: 'amber' },
    CLOSED: { value: 'CLOSED', label: 'تم الإغلاق', color: 'emerald' },
    REJECTED: { value: 'REJECTED', label: 'مرفوض', color: 'red' },
};

export const MATCH_STATUS_OPTIONS = Object.values(MATCH_STATUSES);

// =====================
// الأدوار - Role
// =====================
export const ROLES = {
    ADMIN: { value: 'ADMIN', label: 'مدير نظام', color: 'rose' },
    MANAGER: { value: 'MANAGER', label: 'مدير', color: 'amber' },
    BROKER: { value: 'BROKER', label: 'وسيط', color: 'emerald' },
};

export const ROLE_OPTIONS = Object.values(ROLES);

// =====================
// أنواع الفرق - TeamType
// =====================
export const TEAM_TYPES = {
    LANDS: { value: 'LANDS', label: 'أراضي' },
    PROPERTIES: { value: 'PROPERTIES', label: 'عقارات' },
    MAINTENANCE: { value: 'MAINTENANCE', label: 'صيانة' },
    RENTAL: { value: 'RENTAL', label: 'تأجير' },
    ASSET_MANAGEMENT: { value: 'ASSET_MANAGEMENT', label: 'إدارة أصول' },
};

export const TEAM_TYPE_OPTIONS = Object.values(TEAM_TYPES);

// =====================
// دور العضو في الفريق - TeamRole
// =====================
export const TEAM_ROLES = {
    MANAGER: { value: 'MANAGER', label: 'مدير' },
    MEMBER: { value: 'MEMBER', label: 'عضو' },
};

export const TEAM_ROLE_OPTIONS = Object.values(TEAM_ROLES);

// =====================
// أنواع التنبيهات - NotificationType
// =====================
export const NOTIFICATION_TYPES = {
    MATCH: { value: 'MATCH', label: 'مطابقة' },
    MESSAGE: { value: 'MESSAGE', label: 'رسالة' },
    SYSTEM: { value: 'SYSTEM', label: 'نظام' },
};

// =====================
// حالة التنبيه - NotificationStatus
// =====================
export const NOTIFICATION_STATUSES = {
    UNREAD: { value: 'UNREAD', label: 'غير مقروء' },
    READ: { value: 'READ', label: 'مقروء' },
    ARCHIVED: { value: 'ARCHIVED', label: 'مؤرشف' },
};

// =====================
// عدد الوسطاء إلى المالك
// =====================
export const BROKERS_COUNT_OPTIONS = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
];

// =====================
// Helper Functions
// =====================

/**
 * الحصول على label من value
 * @param {Object} enumObj - الـ enum object
 * @param {string} value - القيمة
 * @returns {string} - الـ label
 */
export const getLabelByValue = (enumObj, value) => {
    const item = Object.values(enumObj).find(item => item.value === value);
    return item?.label || value;
};

/**
 * الحصول على color من value
 * @param {Object} enumObj - الـ enum object
 * @param {string} value - القيمة
 * @returns {string} - اللون
 */
export const getColorByValue = (enumObj, value) => {
    const item = Object.values(enumObj).find(item => item.value === value);
    return item?.color || 'slate';
};
