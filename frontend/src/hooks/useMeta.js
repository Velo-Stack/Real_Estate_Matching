import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

/**
 * useMeta - Hook لجلب البيانات الوصفية (Enums, Cities, Neighborhoods)
 * يتم تخزينها في الـ cache لمدة طويلة (staleTime: 10 دقائق)
 */
const useMeta = () => {
    // جلب الـ Enums
    const {
        data: enums,
        isLoading: enumsLoading,
    } = useQuery({
        queryKey: ['meta', 'enums'],
        queryFn: async () => {
            const { data } = await api.get('/meta/enums');
            return data;
        },
        staleTime: 10 * 60 * 1000, // 10 دقائق
    });

    // جلب المدن
    const {
        data: cities = [],
        isLoading: citiesLoading,
    } = useQuery({
        queryKey: ['meta', 'cities'],
        queryFn: async () => {
            const { data } = await api.get('/meta/cities');
            return data;
        },
        staleTime: 10 * 60 * 1000,
    });

    // جلب الأحياء (يحتاج cityId)
    const getNeighborhoods = (cityId) => {
        return useQuery({
            queryKey: ['meta', 'neighborhoods', cityId],
            queryFn: async () => {
                if (!cityId) return [];
                const { data } = await api.get(`/meta/neighborhoods?cityId=${cityId}`);
                return data;
            },
            staleTime: 10 * 60 * 1000,
            enabled: !!cityId,
        });
    };

    return {
        // Enums
        enums,
        enumsLoading,

        // Cities
        cities,
        citiesLoading,

        // تحويل المدن لـ options
        cityOptions: cities.map(city => ({
            value: city.id,
            label: city.nameAr || city.name,
        })),

        // جلب الأحياء
        getNeighborhoods,

        // Loading
        isLoading: enumsLoading || citiesLoading,
    };
};

/**
 * useNeighborhoods - Hook منفصل لجلب الأحياء
 * @param {number} cityId - معرف المدينة
 */
export const useNeighborhoods = (cityId) => {
    const {
        data: neighborhoods = [],
        isLoading,
    } = useQuery({
        queryKey: ['meta', 'neighborhoods', cityId],
        queryFn: async () => {
            if (!cityId) return [];
            const { data } = await api.get(`/meta/neighborhoods?cityId=${cityId}`);
            return data;
        },
        staleTime: 10 * 60 * 1000,
        enabled: !!cityId,
    });

    return {
        neighborhoods,
        isLoading,
        neighborhoodOptions: neighborhoods.map(n => ({
            value: n.id,
            label: n.nameAr || n.name,
        })),
    };
};

export default useMeta;
