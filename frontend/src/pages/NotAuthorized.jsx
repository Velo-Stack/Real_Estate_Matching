import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldWarning, House } from 'phosphor-react';

const NotAuthorized = () => {
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
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30 flex items-center justify-center">
              <ShieldWarning size={36} className="text-red-400" weight="duotone" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-red-500/30">
              403
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-white mb-3">
          صلاحية غير كافية
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          ليس لديك صلاحية للوصول إلى هذه الصفحة. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع مسئول النظام.
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

export default NotAuthorized;
