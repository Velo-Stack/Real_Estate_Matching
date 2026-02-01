import { inputClasses, labelClasses } from '../../constants/styles';

/**
 * FormField - حقل نموذج موحد
 * يدعم: input, select, textarea
 * 
 * @param {string} label - عنوان الحقل
 * @param {string} name - اسم الحقل
 * @param {string} type - نوع الحقل (text, number, email, select, textarea)
 * @param {string} value - القيمة الحالية
 * @param {function} onChange - دالة التغيير
 * @param {array} options - خيارات الـ select [{value, label}]
 * @param {string} placeholder - النص الإرشادي
 * @param {boolean} required - هل الحقل مطلوب
 * @param {number} rows - عدد الصفوف (للـ textarea)
 * @param {string} dir - اتجاه النص (rtl, ltr)
 */
const FormField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    options = [],
    placeholder = '',
    required = false,
    rows = 3,
    dir = 'rtl',
    className = '',
}) => {
    const renderInput = () => {
        const commonProps = {
            name,
            value,
            onChange,
            required,
            className: `${inputClasses} ${className}`,
        };

        // Select
        if (type === 'select') {
            return (
                <select {...commonProps}>
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
        }

        // Textarea
        if (type === 'textarea') {
            return (
                <textarea
                    {...commonProps}
                    rows={rows}
                    placeholder={placeholder}
                    dir={dir}
                />
            );
        }

        // Input (text, number, email, password, etc.)
        return (
            <input
                {...commonProps}
                type={type}
                placeholder={placeholder}
                dir={dir}
            />
        );
    };

    return (
        <div>
            {label && <label className={labelClasses}>{label}</label>}
            {renderInput()}
        </div>
    );
};

export default FormField;
