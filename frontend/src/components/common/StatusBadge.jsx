/**
 * StatusBadge - شارة الحالة الملونة
 * 
 * @param {string} status - الحالة (NEW, CONTACTED, etc.)
 * @param {object} config - تكوين الحالة {label, bg, text, border, dot}
 * @param {ReactNode} icon - أيقونة اختيارية
 */
const StatusBadge = ({ status, config, icon: Icon }) => {
    // تكوين افتراضي
    const defaultConfig = {
        label: status,
        bg: 'bg-slate-500/10',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
        dot: 'bg-slate-400',
    };

    const cfg = config || defaultConfig;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${cfg.bg} ${cfg.text} border ${cfg.border}`}
        >
            {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
            {Icon && <Icon size={12} weight="fill" />}
            {cfg.label}
        </span>
    );
};

// تكوينات الحالات الجاهزة
export const STATUS_CONFIGS = {
    // حالات المطابقة
    NEW: { label: 'جديد', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', dot: 'bg-violet-400' },
    CONTACTED: { label: 'تم التواصل', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
    NEGOTIATION: { label: 'تفاوض', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    CLOSED: { label: 'تم الإغلاق', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    REJECTED: { label: 'مرفوض', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' },

    // الأولويات
    HIGH: { label: 'مرتفعة', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    MEDIUM: { label: 'متوسطة', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    LOW: { label: 'منخفضة', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },

    // الحصرية
    EXCLUSIVE: { label: 'حصري', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    NON_EXCLUSIVE: { label: 'غير حصري', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },

    // الأدوار
    ADMIN: { label: 'مدير نظام', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    MANAGER: { label: 'مدير', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    BROKER: { label: 'وسيط', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export default StatusBadge;
