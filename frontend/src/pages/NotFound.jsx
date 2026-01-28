import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileX, House } from 'phosphor-react';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl px-10 py-12 max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center">
              <FileX size={36} className="text-amber-400" weight="duotone" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-amber-500/30">
              404
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-white mb-3">
          الصفحة غير موجودة
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          ربما تم نقل الصفحة أو حذفها. يرجى التأكد من العنوان أو العودة للوحة التحكم.
        </p>

        {/* Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 text-white text-sm font-semibold px-6 py-3 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
          >
            <House size={18} weight="duotone" />
            العودة إلى لوحة التحكم
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
