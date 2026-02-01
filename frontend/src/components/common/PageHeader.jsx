import { motion } from 'framer-motion';
import { Plus } from 'phosphor-react';
import { primaryButtonClasses, dangerButtonClasses } from '../../constants/styles';

/**
 * PageHeader - رأس الصفحة الموحد
 * يحتوي على: العنوان الفرعي + أزرار الإجراءات
 * 
 * @param {string} subtitle - الوصف الفرعي
 * @param {function} onAdd - دالة الإضافة
 * @param {string} addLabel - نص زر الإضافة
 * @param {array} actions - أزرار إضافية [{label, icon, onClick, variant}]
 */
const PageHeader = ({
    subtitle,
    onAdd,
    addLabel = 'إضافة جديد',
    actions = [],
}) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                {/* أزرار إضافية */}
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    const buttonClass = action.variant === 'danger'
                        ? dangerButtonClasses
                        : primaryButtonClasses;

                    return (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={action.onClick}
                            className={buttonClass}
                        >
                            {Icon && <Icon size={20} weight="bold" />}
                            {action.label}
                        </motion.button>
                    );
                })}

                {/* زر الإضافة الرئيسي */}
                {onAdd && (
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={onAdd}
                        className={primaryButtonClasses}
                    >
                        <Plus size={20} weight="bold" />
                        {addLabel}
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
