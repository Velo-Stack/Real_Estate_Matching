/**
 * ملف الـ CSS Classes المشتركة
 * يُستخدم في جميع الصفحات لتوحيد التصميم وتجنب التكرار
 */

// =====================
// Form Inputs
// =====================
export const inputClasses = `
  w-full rounded-xl border border-white/10 bg-white/5 
  px-4 py-3 text-sm text-white placeholder-slate-500 
  outline-none transition-all duration-300 
  focus:border-emerald-500/50 focus:bg-white/10 
  focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]
`.replace(/\s+/g, ' ').trim();

export const labelClasses = "block mb-2 text-sm font-medium text-slate-300";

export const selectClasses = `
  rounded-xl border border-white/10 bg-white/5 
  px-3 py-2 text-sm text-white 
  outline-none transition-all duration-300 
  focus:border-emerald-500/50 focus:bg-white/10 
  focus:shadow-[0_0_20px_rgba(16,185,129,0.15)]
`.replace(/\s+/g, ' ').trim();

// =====================
// Buttons
// =====================
export const primaryButtonClasses = `
  inline-flex items-center gap-2 rounded-xl 
  bg-gradient-to-l from-emerald-500 to-cyan-500 
  text-white text-sm font-semibold px-5 py-2.5 
  shadow-lg shadow-emerald-500/25 
  hover:shadow-emerald-500/40 transition-all duration-300
`.replace(/\s+/g, ' ').trim();

export const secondaryButtonClasses = `
  inline-flex items-center gap-2 rounded-xl 
  bg-gradient-to-l from-cyan-500 to-emerald-500 
  text-white text-sm font-semibold px-5 py-2.5 
  shadow-lg shadow-cyan-500/25 
  hover:shadow-cyan-500/40 transition-all duration-300
`.replace(/\s+/g, ' ').trim();

export const dangerButtonClasses = `
  inline-flex items-center gap-2 rounded-xl 
  bg-gradient-to-l from-red-500 to-pink-500 
  text-white text-sm font-semibold px-5 py-2.5 
  shadow-lg shadow-red-500/25 
  hover:shadow-red-500/40 transition-all duration-300
`.replace(/\s+/g, ' ').trim();

export const editButtonClasses = `
  inline-flex items-center gap-1 text-xs rounded-lg 
  border border-white/10 bg-white/5 px-3 py-1.5 
  text-slate-300 hover:bg-emerald-500/10 
  hover:border-emerald-500/30 hover:text-emerald-400 
  transition-all duration-300
`.replace(/\s+/g, ' ').trim();

export const deleteButtonClasses = `
  inline-flex items-center gap-1 text-xs rounded-lg 
  border border-red-500/20 bg-red-500/5 px-3 py-1.5 
  text-red-400 hover:bg-red-500/10 
  hover:border-red-500/40 transition-all duration-300
`.replace(/\s+/g, ' ').trim();

export const submitButtonClasses = `
  w-full rounded-xl bg-gradient-to-l from-emerald-500 to-cyan-500 
  text-white text-sm font-bold py-3.5 
  shadow-lg shadow-emerald-500/25 
  hover:shadow-emerald-500/40 transition-all duration-300 
  disabled:opacity-60 disabled:cursor-not-allowed
`.replace(/\s+/g, ' ').trim();

// =====================
// Cards
// =====================
export const cardClasses = `
  bg-[#111827]/60 backdrop-blur-xl rounded-2xl 
  border border-white/5 p-6
`.replace(/\s+/g, ' ').trim();

export const statCardClasses = `
  relative overflow-hidden bg-[#111827]/60 backdrop-blur-xl 
  rounded-2xl border border-white/5 p-6 
  group cursor-pointer
`.replace(/\s+/g, ' ').trim();

// =====================
// Icons & Badges
// =====================
export const iconContainerClasses = (color = 'emerald') => `
  h-8 w-8 rounded-lg bg-gradient-to-br 
  from-${color}-500/20 to-${color}-600/10 
  flex items-center justify-center
`.replace(/\s+/g, ' ').trim();

// =====================
// Gradients
// =====================
export const gradients = {
    emerald: 'from-emerald-500 to-emerald-600',
    cyan: 'from-cyan-500 to-cyan-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    red: 'from-red-500 to-pink-500',
};

// =====================
// Loading States
// =====================
export const spinnerClasses = (color = 'emerald') => `
  w-8 h-8 border-2 border-${color}-500/30 
  border-t-${color}-500 rounded-full animate-spin
`.replace(/\s+/g, ' ').trim();
