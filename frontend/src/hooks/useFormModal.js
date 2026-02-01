import { useState, useCallback } from 'react';

/**
 * useFormModal - Hook لإدارة حالة Modal والـ Form
 * 
 * @param {object} emptyData - البيانات الافتراضية للنموذج
 */
const useFormModal = (emptyData = {}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState(emptyData);

    // فتح Modal للإنشاء
    const openCreate = useCallback(() => {
        setEditingItem(null);
        setFormData(emptyData);
        setIsOpen(true);
    }, [emptyData]);

    // فتح Modal للتعديل
    const openEdit = useCallback((item, mapFn) => {
        setEditingItem(item);
        // إذا تم تمرير دالة mapping، استخدمها
        if (mapFn) {
            setFormData(mapFn(item));
        } else {
            setFormData({ ...emptyData, ...item });
        }
        setIsOpen(true);
    }, [emptyData]);

    // إغلاق Modal
    const close = useCallback(() => {
        setIsOpen(false);
        // تأخير إعادة تعيين البيانات لتجنب الـ flicker
        setTimeout(() => {
            setEditingItem(null);
            setFormData(emptyData);
        }, 200);
    }, [emptyData]);

    // تحديث حقل في النموذج
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }, []);

    // تحديث قيمة معينة
    const setValue = useCallback((name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    // إعادة تعيين النموذج
    const reset = useCallback(() => {
        setFormData(emptyData);
        setEditingItem(null);
    }, [emptyData]);

    // هل في وضع التعديل؟
    const isEditing = editingItem !== null;

    return {
        // حالة Modal
        isOpen,
        setIsOpen,

        // حالة النموذج
        formData,
        setFormData,
        editingItem,
        isEditing,

        // الإجراءات
        openCreate,
        openEdit,
        close,
        handleChange,
        setValue,
        reset,
    };
};

export default useFormModal;
