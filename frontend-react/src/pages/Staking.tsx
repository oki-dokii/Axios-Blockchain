import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, TrendingUp, Clock } from 'lucide-react';
import { api } from '../lib/services/api';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';

interface Stake {
    id: string;
    amount: number;
    duration: number;
    endTime: string;
    claimed: boolean;
    stakeId?: number;
}

export function Staking() {
    const [stakes, setStakes] = useState<Stake[]>([]);
    const [loading, setLoading] = useState(true);
    const [staking, setStaking] = useState(false);
    const [unstakingId, setUnstakingId] = useState<string | null>(null);
    const [showStakeModal, setShowStakeModal] = useState(false);
    const { isAuthenticated, user } = useUser();
    const { addNotification } = useNotifications();

    const isCompany = user?.role?.toUpperCase() === 'COMPANY';

    const [amount, setAmount] = useState(100);
    const [duration, setDuration] = useState(30);

    const loadStakes = useCallback(async () => {
        setLoading(true);
        try {
            if (isAuthenticated) {
                const response = await api.getMyStakes();
                // @ts-ignore - Handle backend wrapper
                setStakes(response.stakes || response || []);
            }
        } catch (error) {
            console.error('Failed to load stakes:', error);
            addNotification('error', 'Failed to load stakes');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, addNotification]);

    useEffect(() => {
        loadStakes();
    }, [loadStakes]);

    async function handleStake() {
        if (!amount || amount <= 0) {
            addNotification('error', 'Please enter a valid amount');
            return;
        }

        setStaking(true);
        try {
            await api.createStake(amount, duration);
            addNotification('success', 'Stake created successfully!');
            setShowStakeModal(false);
            loadStakes();
            setAmount(100); // Reset default
        } catch (error) {
            console.error('Stake failed:', error);
            addNotification('error', 'Failed to create stake');
        } finally {
            setStaking(false);
        }
    }

    async function handleUnstake(stakeId: string) {
        setUnstakingId(stakeId);
        try {
            await api.claimStake(stakeId);
            addNotification('success', 'Stake claimed successfully!');
            loadStakes();
        } catch (error) {
            console.error('Unstake failed:', error);
            addNotification('error', 'Failed to unstake');
        } finally {
            setUnstakingId(null);
        }
    }

    function calculateReward(amount: number, durationDays: number) {
        const apy = 0.05;
        return (amount * apy * (durationDays / 365)).toFixed(2);
    }

    function isStakeEnded(endTime: string) {
        return new Date(endTime) < new Date();
    }

    const totalStaked = stakes.reduce((acc, s) => acc + (s.claimed ? 0 : s.amount), 0);
    const activeStakes = stakes.filter(s => !s.claimed).length;

    // Show access denied for non-company users
    if (isAuthenticated && !isCompany) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-16">
                    <TrendingUp className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Restricted</h2>
                    <p className="text-secondary-600">
                        Staking is only available to companies. Your role: {user?.role}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                className="flex justify-between items-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <TrendingUp className="h-8 w-8 text-primary-500" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white">Staking Dashboard</h1>
                    </div>
                    <p className="mt-2 text-slate-400 text-lg">
                        Stake your Carbon Credits to earn rewards and governance rights.
                    </p>
                </div>

                <motion.button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
                    onClick={() => setShowStakeModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    New Stake
                </motion.button>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} className="text-primary-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/20 text-primary-400 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Staked</p>
                            <p className="text-2xl font-bold text-white">{totalStaked} Credits</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={64} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Active Stakes</p>
                            <p className="text-2xl font-bold text-white">{activeStakes}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Estimated APY</p>
                            <p className="text-2xl font-bold text-white">5.0% - 15.0%</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </div>
            ) : stakes.length === 0 ? (
                <motion.div
                    className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <TrendingUp size={48} className="mx-auto text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No active stakes</h3>
                    <p className="text-slate-400">Start staking to earn rewards!</p>
                </motion.div>
            ) : (
                <motion.div
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <table className="min-w-full divide-y divide-white/10">
                        <thead className="bg-black/20">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">End Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Reward</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {stakes.map((stake) => (
                                <tr key={stake.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                        {stake.amount} Credits
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {Math.round(stake.duration / (24 * 60 * 60))} Days
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                        {new Date(stake.endTime).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-400 font-medium">
                                        +{calculateReward(stake.amount, stake.duration / (24 * 60 * 60))}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {stake.claimed ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30">
                                                Claimed
                                            </span>
                                        ) : isStakeEnded(stake.endTime) ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                Ready to Unstake
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30">
                                                Staking
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {!stake.claimed && isStakeEnded(stake.endTime) ? (
                                            <button
                                                className="text-primary-400 hover:text-primary-300 font-bold transition-colors"
                                                disabled={unstakingId === stake.id}
                                                onClick={() => handleUnstake(stake.id)}
                                            >
                                                {unstakingId === stake.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    'Unstake & Claim'
                                                )}
                                            </button>
                                        ) : !stake.claimed ? (
                                            <span className="text-slate-600 cursor-not-allowed">Locked</span>
                                        ) : (
                                            <span className="text-slate-600">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            )}

            {/* Create Stake Modal */}
            <AnimatePresence>
                {showStakeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowStakeModal(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        <motion.div
                            className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <h3 className="text-xl font-bold text-white mb-6">Create New Stake</h3>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Amount (Credits)
                                    </label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        min="1"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Duration (Days)
                                    </label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    >
                                        <option value={30} className="bg-slate-900">30 Days (5% APY)</option>
                                        <option value={90} className="bg-slate-900">90 Days (7% APY)</option>
                                        <option value={180} className="bg-slate-900">180 Days (10% APY)</option>
                                        <option value={365} className="bg-slate-900">365 Days (15% APY)</option>
                                    </select>
                                </div>
                                <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl flex justify-between items-center">
                                    <span className="text-primary-200">Estimated Reward:</span>
                                    <span className="font-bold text-primary-400 text-lg">
                                        +{calculateReward(amount, duration)} Credits
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10"
                                    onClick={() => setShowStakeModal(false)}
                                    disabled={staking}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
                                    disabled={staking}
                                    onClick={handleStake}
                                >
                                    {staking ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Stake Tokens'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
