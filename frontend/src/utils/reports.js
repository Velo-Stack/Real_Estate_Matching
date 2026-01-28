import api from './api';
import { toast } from 'sonner';

export const downloadReport = async (type, format) => {
  try {
    const endpoint = format === 'excel' ? '/reports/export/excel' : '/reports/export/pdf';
    const { data, headers } = await api.get(endpoint, {
      params: { type },
      responseType: 'blob',
    });

    const blob = new Blob([data], {
      type:
        format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const disposition = headers['content-disposition'];
    const match = disposition && disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `report-${type}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    link.setAttribute('download', decodeURIComponent(filename));
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    toast.error('فشل تحميل التقرير، يرجى المحاولة مرة أخرى.');
  }
};


