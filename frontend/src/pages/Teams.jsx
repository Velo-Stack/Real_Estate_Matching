import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Buildings, Trash, CaretDown, CaretUp } from 'phosphor-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { hasRole, ROLES } from '../utils/rbac';
import { PageHeader } from '../components/common';
import Modal from '../components/Modal';
import { inputClasses, labelClasses, submitButtonClasses } from '../constants/styles';
import { TEAM_TYPE_OPTIONS, TEAM_ROLE_OPTIONS, getLabelByValue, TEAM_TYPES } from '../constants/enums';

const Teams = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'LANDS' });
    const [memberData, setMemberData] = useState({ userId: '', role: 'MEMBER' });

    // Fetch teams
    const { data: teams = [], isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await api.get('/teams');
            return data;
        },
    });

    // Fetch users for member dropdown
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });

    // Create team
    const createTeamMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post('/teams', payload);
            return data;
        },
        onSuccess: () => {
            toast.success('تم إنشاء الفريق بنجاح');
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setIsModalOpen(false);
            setFormData({ name: '', type: 'LANDS' });
        },
        onError: () => toast.error('فشل إنشاء الفريق'),
    });

    // Add member
    const addMemberMutation = useMutation({
        mutationFn: async ({ teamId, payload }) => {
            const { data } = await api.post(`/teams/${teamId}/members`, payload);
            return data;
        },
        onSuccess: () => {
            toast.success('تم إضافة العضو بنجاح');
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            setIsMemberModalOpen(false);
            setMemberData({ userId: '', role: 'MEMBER' });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'فشل إضافة العضو'),
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleMemberChange = (e) => setMemberData({ ...memberData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        createTeamMutation.mutate(formData);
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!selectedTeam) return;
        addMemberMutation.mutate({ teamId: selectedTeam.id, payload: { userId: parseInt(memberData.userId), role: memberData.role } });
    };

    const openMemberModal = (team) => {
        setSelectedTeam(team);
        setIsMemberModalOpen(true);
    };

    const toggleExpand = (teamId) => {
        setExpandedTeam(expandedTeam === teamId ? null : teamId);
    };

    const isAdmin = hasRole(user, [ROLES.ADMIN]);

    // Team type colors
    const typeColors = {
        LANDS: 'from-emerald-500 to-cyan-500',
        PROPERTIES: 'from-violet-500 to-purple-500',
        MAINTENANCE: 'from-amber-500 to-orange-500',
        RENTAL: 'from-cyan-500 to-blue-500',
        ASSET_MANAGEMENT: 'from-rose-500 to-pink-500',
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                subtitle="إدارة فرق العمل"
                onAdd={isAdmin ? () => setIsModalOpen(true) : null}
                addLabel="إنشاء فريق جديد"
            />

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${typeColors[team.type] || typeColors.LANDS} p-4`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Buildings size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{team.name}</h3>
                                        <p className="text-white/70 text-xs">{getLabelByValue(TEAM_TYPES, team.type)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-lg">
                                        {team.members?.length || 0} أعضاء
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 space-y-3">
                            <div className="flex gap-2">
                                {isAdmin && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => openMemberModal(team)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                                    >
                                        <UserPlus size={16} />
                                        إضافة عضو
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => toggleExpand(team.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-slate-400 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
                                >
                                    {expandedTeam === team.id ? <CaretUp size={16} /> : <CaretDown size={16} />}
                                    {expandedTeam === team.id ? 'إخفاء الأعضاء' : 'عرض الأعضاء'}
                                </motion.button>
                            </div>

                            {/* Members List */}
                            <AnimatePresence>
                                {expandedTeam === team.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 pt-2 border-t border-white/5"
                                    >
                                        {team.members?.length === 0 ? (
                                            <p className="text-slate-500 text-sm text-center py-2">لا يوجد أعضاء</p>
                                        ) : (
                                            team.members?.map((member) => (
                                                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                                            {member.user?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="text-white text-sm">{member.user?.name}</p>
                                                            <p className="text-slate-500 text-xs">{member.role === 'MANAGER' ? 'مدير' : 'عضو'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ))}
            </div>

            {teams.length === 0 && (
                <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">لا توجد فرق حالياً</p>
                </div>
            )}

            {/* Create Team Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إنشاء فريق جديد">
                <form onSubmit={handleSubmit} className="space-y-5 text-right">
                    <div>
                        <label className={labelClasses}>اسم الفريق</label>
                        <input name="name" className={inputClasses} value={formData.name} onChange={handleChange} required placeholder="مثال: فريق الأراضي" />
                    </div>
                    <div>
                        <label className={labelClasses}>نوع الفريق</label>
                        <select name="type" className={inputClasses} value={formData.type} onChange={handleChange} required>
                            {TEAM_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={createTeamMutation.isPending} className={submitButtonClasses}>
                        {createTeamMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الفريق'}
                    </motion.button>
                </form>
            </Modal>

            {/* Add Member Modal */}
            <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title={`إضافة عضو إلى ${selectedTeam?.name || ''}`}>
                <form onSubmit={handleAddMember} className="space-y-5 text-right">

                    {/* قائمة الأعضاء */}
                    <div>
                        <label className={labelClasses}>اختر العضو</label>
                        <div className="max-h-64 overflow-y-auto space-y-2 p-2 rounded-xl bg-white/5 border border-white/10">
                            {users.filter(u => !selectedTeam?.members?.some(m => m.user?.id === u.id)).length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">لا يوجد أعضاء متاحين</p>
                            ) : (
                                users.filter(u => !selectedTeam?.members?.some(m => m.user?.id === u.id)).map(u => (
                                    <motion.div
                                        key={u.id}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setMemberData({ ...memberData, userId: u.id.toString() })}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${memberData.userId === u.id.toString()
                                            ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30'
                                            : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${memberData.userId === u.id.toString()
                                            ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white'
                                            : 'bg-white/10 text-slate-400'
                                            }`}>
                                            {u.name?.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${memberData.userId === u.id.toString() ? 'text-white' : 'text-slate-300'}`}>
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-lg ${u.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                                            u.role === 'MANAGER' ? 'bg-violet-500/10 text-violet-400' :
                                                'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {u.role === 'ADMIN' ? 'مسؤول' : u.role === 'MANAGER' ? 'مدير' : 'وسيط'}
                                        </span>
                                        {memberData.userId === u.id.toString() && (
                                            <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={!memberData.userId || addMemberMutation.isPending}
                        className={submitButtonClasses}
                    >
                        {addMemberMutation.isPending ? 'جاري الإضافة...' : 'إضافة العضو'}
                    </motion.button>
                </form>
            </Modal>
        </div>
    );
};

export default Teams;
