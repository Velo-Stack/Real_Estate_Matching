import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';

/**
 * useExport - Hook لتصدير البيانات (PDF/Excel)
 * 
 * @param {string} type - نوع البيانات (offers, requests, matches)
 */
const useExport = (type) => {
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);

    // تصدير PDF
    const exportPDF = useCallback(async () => {
        if (isExportingPDF) return;

        setIsExportingPDF(true);
        try {
            const response = await api.get(`/reports/export/pdf?type=${type}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${type}-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('تم تصدير الملف بنجاح');
        } catch (error) {
            console.error('Export PDF error:', error);
            toast.error('فشل تصدير الملف');
        } finally {
            setIsExportingPDF(false);
        }
    }, [type, isExportingPDF]);

    // تصدير Excel
    const exportExcel = useCallback(async () => {
        if (isExportingExcel) return;

        setIsExportingExcel(true);
        try {
            const response = await api.get(`/reports/export/excel?type=${type}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${type}-${Date.now()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('تم تصدير الملف بنجاح');
        } catch (error) {
            console.error('Export Excel error:', error);
            toast.error('فشل تصدير الملف');
        } finally {
            setIsExportingExcel(false);
        }
    }, [type, isExportingExcel]);

    return {
        exportPDF,
        exportExcel,
        isExportingPDF,
        isExportingExcel,
        isExporting: isExportingPDF || isExportingExcel,
    };
};

export default useExport;
