import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatCircle, PaperPlaneRight, Plus, Users, UsersThree } from 'phosphor-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { hasRole, ROLES } from '../utils/rbac';
import Modal from '../components/Modal';
import { inputClasses, labelClasses, submitButtonClasses } from '../constants/styles';

const Chat = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedConv, setSelectedConv] = useState(null);
    const [message, setMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newConv, setNewConv] = useState({ title: '', participantIds: [] });
    const messagesEndRef = useRef(null);

    // Fetch conversations
    const { data: conversations = [], isLoading: convsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data } = await api.get('/conversations');
            return data;
        },
    });

    // Fetch users (only for ADMIN/MANAGER)
    const canCreateConv = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
    const { data: users = [] } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
        enabled: canCreateConv,
    });

    // Fetch messages
    const { data: messages = [], isLoading: msgsLoading } = useQuery({
        queryKey: ['messages', selectedConv?.id],
        queryFn: async () => {
            if (!selectedConv) return [];
            const { data } = await api.get(`/conversations/${selectedConv.id}/messages`);
            return data;
        },
        enabled: !!selectedConv,
        refetchInterval: 5000, // Polling
    });

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Create conversation
    const createConvMutation = useMutation({
        mutationFn: async (payload) => {
            const { data } = await api.post('/conversations', payload);
            return data;
        },
        onSuccess: (data) => {
            toast.success('تم إنشاء المحادثة');
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setSelectedConv(data);
            setIsModalOpen(false);
            setNewConv({ title: '', participantIds: [] });
        },
        onError: () => toast.error('فشل إنشاء المحادثة'),
    });

    // Send message
    const sendMutation = useMutation({
        mutationFn: async ({ convId, body }) => {
            const { data } = await api.post(`/conversations/${convId}/messages`, { body });
            return data;
        },
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['messages', selectedConv?.id] });
        },
        onError: () => toast.error('فشل إرسال الرسالة'),
    });

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedConv) return;
        sendMutation.mutate({ convId: selectedConv.id, body: message.trim() });
    };

    const handleCreateConv = (e) => {
        e.preventDefault();
        createConvMutation.mutate(newConv);
    };

    const toggleParticipant = (userId) => {
        setNewConv(prev => ({
            ...prev,
            participantIds: prev.participantIds.includes(userId)
                ? prev.participantIds.filter(id => id !== userId)
                : [...prev.participantIds, userId]
        }));
    };

    // Get conv title
    const getConvTitle = (conv) => {
        if (conv.title) return conv.title;
        if (conv.team) return conv.team.name;
        const others = conv.participants?.filter(p => p.user?.id !== user?.id);
        if (others?.length === 1) return others[0].user?.name;
        return `محادثة (${conv.participants?.length || 0})`;
    };

    return (
        <div className="flex h-[calc(100vh-120px)] bg-[#111827]/60 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-l border-white/5 flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-white font-bold">المحادثات</h2>
                    {canCreateConv && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsModalOpen(true)}
                            className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                        >
                            <Plus size={18} weight="bold" />
                        </motion.button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {convsLoading ? (
                        <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">لا توجد محادثات</div>
                    ) : (
                        conversations.map((conv) => (
                            <motion.button
                                key={conv.id}
                                whileHover={{ x: -4 }}
                                onClick={() => setSelectedConv(conv)}
                                className={`w-full text-right p-3 rounded-xl transition-all ${selectedConv?.id === conv.id
                                    ? 'bg-gradient-to-l from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30'
                                    : 'hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${conv.team ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                        {conv.team ? <UsersThree size={20} /> : <Users size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{getConvTitle(conv)}</p>
                                        <p className="text-slate-500 text-xs">{conv.team ? 'محادثة فريق' : 'محادثة خاصة'}</p>
                                    </div>
                                </div>
                            </motion.button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConv ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${selectedConv.team ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                {selectedConv.team ? <UsersThree size={20} /> : <ChatCircle size={20} />}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{getConvTitle(selectedConv)}</h3>
                                <p className="text-slate-500 text-xs">{selectedConv.participants?.length || 0} مشاركين</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {msgsLoading ? (
                                <div className="text-center py-8 text-slate-500">جاري التحميل...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">لا توجد رسائل</div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.senderId === user?.id || msg.sender?.id === user?.id;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-[70%] p-3 rounded-2xl ${isMine
                                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                                                : 'bg-white/5 text-white border border-white/10'
                                                }`}>
                                                {!isMine && (
                                                    <p className="text-xs text-emerald-400 mb-1">{msg.sender?.name}</p>
                                                )}
                                                <p className="text-sm">{msg.body}</p>
                                                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-slate-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-3">
                            <input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="اكتب رسالتك..."
                                className={`${inputClasses} flex-1`}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={!message.trim() || sendMutation.isPending}
                                className="h-12 w-12 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white flex items-center justify-center disabled:opacity-50"
                            >
                                <PaperPlaneRight size={20} weight="fill" />
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <ChatCircle size={64} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-400">اختر محادثة للبدء</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Conv Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="محادثة جديدة">
                <form onSubmit={handleCreateConv} className="space-y-5 text-right">
                    <div>
                        <label className={labelClasses}>عنوان المحادثة (اختياري)</label>
                        <input
                            className={inputClasses}
                            value={newConv.title}
                            onChange={(e) => setNewConv({ ...newConv, title: e.target.value })}
                            placeholder="مثال: مناقشة المشروع"
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>اختر المشاركين</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-white/5 border border-white/10">
                            {users.filter(u => u.id !== user?.id).map(u => (
                                <label key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={newConv.participantIds.includes(u.id)}
                                        onChange={() => toggleParticipant(u.id)}
                                        className="rounded border-white/20"
                                    />
                                    <span className="text-white text-sm">{u.name}</span>
                                    <span className="text-slate-500 text-xs">({u.role})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={newConv.participantIds.length === 0 || createConvMutation.isPending}
                        className={submitButtonClasses}
                    >
                        {createConvMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء المحادثة'}
                    </motion.button>
                </form>
            </Modal>
        </div>
    );
};

export default Chat;
