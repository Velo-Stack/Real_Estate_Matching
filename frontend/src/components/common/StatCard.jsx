import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'phosphor-react';
import { gradients } from '../../constants/styles';

/**
 * StatCard - كارت الإحصائيات
 * 
 * @param {string} label - عنوان الإحصائية
 * @param {string|number} value - القيمة
 * @param {ReactNode} icon - الأيقونة
 * @param {string} gradient - اسم التدرج (emerald, cyan, violet, amber)
 * @param {string} trend - اتجاه التغير (up, down)
 * @param {number} trendValue - نسبة التغير
 * @param {number} delay - تأخير الأنيميشن
 */
const StatCard = ({
    label,
    value,
    icon: Icon,
    gradient = 'emerald',
    trend,
    trendValue,
    delay = 0,
}) => {
    const gradientClass = gradients[gradient] || gradients.emerald;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative overflow-hidden bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6 group cursor-pointer"
        >
            {/* Background Gradient on Hover */}
            <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradientClass}`}
                style={{ opacity: 0.05 }}
            />

            {/* Icon & Trend */}
            <div className="relative flex items-start justify-between mb-4">
                <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white shadow-lg`}
                >
                    {Icon && <Icon size={24} weight="duotone" />}
                </div>

                {trend && (
                    <div
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${trend === 'up'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                    >
                        {trend === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        {trendValue}%
                    </div>
                )}
            </div>

            {/* Value & Label */}
            <h3 className="relative text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="relative text-sm text-slate-400">{label}</p>
        </motion.div>
    );
};

/**
 * MiniStatCard - كارت إحصائيات صغير
 * يُستخدم في الصفحات الداخلية
 */
export const MiniStatCard = ({
    label,
    value,
    icon: Icon,
    gradient = 'emerald',
    delay = 0,
}) => {
    const gradientClass = gradients[gradient] || gradients.emerald;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#111827]/60 backdrop-blur-xl rounded-xl border border-white/5 p-4 flex items-center gap-4"
        >
            <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
            >
                {Icon && <Icon size={22} className="text-white" weight="duotone" />}
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
            </div>
        </motion.div>
    );
};

export default StatCard;
