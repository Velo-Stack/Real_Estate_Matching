import { useState } from 'react';
import { motion } from 'framer-motion';
import { downloadReport } from '../utils/reports';
import { FileArrowDown, FileXls, FilePdf, Buildings, Target, Handshake, ChartLineUp } from 'phosphor-react';

const selectClasses = "rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-emerald-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]";

const reportTypes = [
  { value: 'offers', label: 'العروض العقارية', icon: Buildings, color: 'from-emerald-500 to-emerald-600' },
  
];

const Reports = () => {
  const [type, setType] = useState('offers');
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      await downloadReport(type, format);
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const selectedReport = reportTypes.find(r => r.value === type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
          <ChartLineUp size={24} className="text-emerald-400" weight="duotone" />
        </div>
        <div>
          <p className="text-white font-semibold">تصدير التقارير</p>
          <p className="text-sm text-slate-500">تحميل بيانات النظام بصيغ مختلفة</p>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = type === report.value;
          return (
            <motion.button
              key={report.value}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setType(report.value)}
              className={`relative overflow-hidden rounded-2xl border p-5 text-right transition-all duration-300 ${isSelected
                  ? 'bg-[#111827]/80 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-[#111827]/40 border-white/5 hover:border-white/10'
                }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="selectedReport"
                  className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5"
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
              <div className="relative flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center shadow-lg`}>
                  <Icon size={22} className="text-white" weight="duotone" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {report.label}
                  </h3>
                  <p className="text-xs text-slate-500">تصدير جميع البيانات</p>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Export Options */}
      <div className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileArrowDown size={20} className="text-slate-400" />
          <h3 className="text-sm font-medium text-white">اختر صيغة التصدير</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Excel Export */}
          {/* <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('excel')}
            disabled={downloading !== null}
            className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group disabled:opacity-60"
          >
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-shadow">
              {downloading === 'excel' ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FileXls size={26} className="text-white" weight="duotone" />
              )}
            </div>
            <div className="text-right flex-1">
              <h4 className="text-white font-semibold mb-0.5">تصدير Excel</h4>
              <p className="text-xs text-slate-500">ملف .xlsx متوافق مع Microsoft Excel</p>
            </div>
          </motion.button> */}

          {/* PDF Export */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleDownload('pdf')}
            disabled={downloading !== null}
            className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 group disabled:opacity-60"
          >
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:shadow-rose-500/40 transition-shadow">
              {downloading === 'pdf' ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FilePdf size={26} className="text-white" weight="duotone" />
              )}
            </div>
            <div className="text-right flex-1">
              <h4 className="text-white font-semibold mb-0.5">تصدير PDF</h4>
              <p className="text-xs text-slate-500">ملف .pdf جاهز للطباعة والمشاركة</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-cyan-400 text-lg">💡</span>
        </div>
        <div>
          <p className="text-sm text-cyan-400 font-medium mb-1">ملاحظة</p>
          <p className="text-xs text-slate-500">
            سيتم تصدير جميع بيانات {selectedReport?.label} المتاحة في النظام. قد يستغرق التصدير بعض الوقت حسب حجم البيانات.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
