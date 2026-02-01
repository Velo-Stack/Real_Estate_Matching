import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../utils/api';

/**
 * useCRUD - Hook عام لعمليات CRUD
 * يدعم: fetch, create, update, delete
 * 
 * @param {string} endpoint - الـ API endpoint (مثال: 'offers', 'requests')
 * @param {object} options - خيارات إضافية
 * @param {object} options.messages - رسائل النجاح والخطأ
 * @param {function} options.onCreateSuccess - callback بعد الإنشاء
 * @param {function} options.onUpdateSuccess - callback بعد التحديث
 * @param {function} options.onDeleteSuccess - callback بعد الحذف
 */
const useCRUD = (endpoint, options = {}) => {
    const queryClient = useQueryClient();
    const queryKey = [endpoint];

    // الرسائل الافتراضية
    const messages = {
        fetchError: 'حدث خطأ أثناء تحميل البيانات',
        createSuccess: 'تم الإنشاء بنجاح',
        createError: 'حدث خطأ أثناء الإنشاء',
        updateSuccess: 'تم التحديث بنجاح',
        updateError: 'حدث خطأ أثناء التحديث',
        deleteSuccess: 'تم الحذف بنجاح',
        deleteError: 'حدث خطأ أثناء الحذف',
        ...options.messages,
    };

    // Fetch all
    const {
        data = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await api.get(`/${endpoint}`);
            return data;
        },
    });

    // Create
    const createMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post(`/${endpoint}`, payload);
            return data;
        },
        onSuccess: (data) => {
            toast.success(messages.createSuccess);
            queryClient.invalidateQueries({ queryKey });
            options.onCreateSuccess?.(data);
        },
        onError: (error) => {
            toast.error(messages.createError);
            console.error('Create error:', error);
        },
    });

    // Update
    const updateMutation = useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await api.put(`/${endpoint}/${id}`, payload);
            return data;
        },
        onSuccess: (data) => {
            toast.success(messages.updateSuccess);
            queryClient.invalidateQueries({ queryKey });
            options.onUpdateSuccess?.(data);
        },
        onError: (error) => {
            toast.error(messages.updateError);
            console.error('Update error:', error);
        },
    });

    // Delete
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await api.delete(`/${endpoint}/${id}`);
        },
        onSuccess: () => {
            toast.success(messages.deleteSuccess);
            queryClient.invalidateQueries({ queryKey });
            options.onDeleteSuccess?.();
        },
        onError: (error) => {
            toast.error(messages.deleteError);
            console.error('Delete error:', error);
        },
    });

    // Update Status (for matches)
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const { data } = await api.patch(`/${endpoint}/${id}`, { status });
            return data;
        },
        onSuccess: () => {
            toast.success('تم تحديث الحالة بنجاح');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: () => {
            toast.error('حدث خطأ أثناء تحديث الحالة');
        },
    });

    return {
        // Data
        data,
        isLoading,
        isError,
        error,
        refetch,

        // Mutations
        create: createMutation.mutate,
        update: updateMutation.mutate,
        remove: deleteMutation.mutate,
        updateStatus: updateStatusMutation.mutate,

        // Loading states
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
    };
};

export default useCRUD;
