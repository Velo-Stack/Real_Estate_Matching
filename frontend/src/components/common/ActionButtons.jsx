import { motion } from 'framer-motion';
import { PencilSimple, Trash } from 'phosphor-react';
import { editButtonClasses, deleteButtonClasses } from '../../constants/styles';

/**
 * ActionButtons - أزرار الإجراءات (تعديل، حذف)
 * 
 * @param {function} onEdit - دالة التعديل
 * @param {function} onDelete - دالة الحذف
 * @param {boolean} canEdit - هل يمكن التعديل
 * @param {boolean} canDelete - هل يمكن الحذف
 * @param {string} editLabel - نص زر التعديل
 * @param {string} deleteLabel - نص زر الحذف
 */
const ActionButtons = ({
    onEdit,
    onDelete,
    canEdit = true,
    canDelete = true,
    editLabel = 'تعديل',
    deleteLabel = 'حذف',
}) => {
    if (!canEdit && !canDelete) return null;

    return (
        <div className="flex gap-2">
            {canEdit && onEdit && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onEdit}
                    className={editButtonClasses}
                >
                    <PencilSimple size={14} />
                    {editLabel}
                </motion.button>
            )}

            {canDelete && onDelete && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={onDelete}
                    className={deleteButtonClasses}
                >
                    <Trash size={14} />
                    {deleteLabel}
                </motion.button>
            )}
        </div>
    );
};

export default ActionButtons;
