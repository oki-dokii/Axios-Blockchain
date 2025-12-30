import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Trophy, Sparkles, Crown, Medal } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { api } from '../lib/services/api';

interface LeaderboardEntry {
    rank: number;
    companyId: string;
    companyName: string;
    walletAddress: string;
    totalCredits: number;
    totalActions: number;
    totalBadges: number;
    verified: boolean;
    change?: string;
}

export function Leaderboard() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<'WEEKLY' | 'MONTHLY' | 'ALL_TIME'>('ALL_TIME');
    const { user } = useUser();
    const { addNotification } = useNotifications();

    const loadLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getLeaderboard(period);
            // API returns { period, leaderboard: [...], total }
            // Or if api.ts unwraps it differently, we adjust. 
            // Based on earlier curl, it returns { leaderboard: [...] }

            const data = (response as any).leaderboard || response || [];

            if (Array.isArray(data)) {
                const mappedEntries = data.map((entry: any, index: number) => ({
                    rank: entry.rank || index + 1,
                    companyId: entry.id,
                    companyName: entry.name || 'Unknown Company',
                    walletAddress: entry.walletAddress,
                    totalCredits: entry.credits || 0,
                    totalActions: entry.actions || 0,
                    totalBadges: entry.badges || 0,
                    verified: entry.verified || false,
                    change: entry.change
                }));
                setEntries(mappedEntries);
            } else {
                setEntries([]);
            }

        } catch (error) {
            console.error('Antigravity: Failed to load leaderboard:', error);
            // Don't spam notifications on load failure, just show empty state or logs
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => {
        loadLeaderboard();
    }, [loadLeaderboard]);

    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-400';
        if (rank === 2) return 'text-slate-300';
        if (rank === 3) return 'text-orange-400';
        return 'text-white';
    };

    const getRankBg = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/50';
        if (rank === 2) return 'bg-slate-500/20 border-slate-500/50';
        if (rank === 3) return 'bg-orange-500/20 border-orange-500/50';
        return 'bg-white/5 border-white/10';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                className="flex justify-between items-center mb-12"
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
                            <Sparkles className="h-8 w-8 text-primary-400" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
                    </div>
                    <p className="mt-2 text-slate-400 text-lg">
                        Top performing companies in carbon credit generation.
                    </p>
                </div>

                <div className="bg-white/5 p-1 rounded-xl border border-white/10 flex gap-1">
                    {(['WEEKLY', 'MONTHLY', 'ALL_TIME'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {p.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Top 3 Podium */}
            {!loading && entries.length >= 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
                    {/* 2nd Place */}
                    <motion.div
                        className="order-2 md:order-1"
                        initial={{ opacity: 0, x: -50, y: 50 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <motion.div
                                className={`w-20 h-20 mx-auto mb-4 rounded-full ${getRankBg(2)} flex items-center justify-center border-2 backdrop-blur-sm`}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Medal className="text-slate-300 w-10 h-10" />
                            </motion.div>
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">2nd Place</div>
                            <h3 className="text-xl font-bold text-white mb-2 truncate">{entries[1].companyName}</h3>
                            <p className="text-2xl font-bold text-primary-400">{entries[1].totalCredits.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">Credits Earned</p>
                        </div>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        className="order-1 md:order-2 z-10"
                        initial={{ opacity: 0, y: -50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                    >
                        <div className="bg-gradient-to-b from-yellow-500/20 to-orange-500/5 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl shadow-yellow-500/10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 animate-pulse"></div>
                            <motion.div
                                className={`w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.3)]`}
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Crown className="text-yellow-400 w-12 h-12" />
                            </motion.div>
                            <div className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2">Champion</div>
                            <h3 className="text-2xl font-bold text-white mb-2 truncate">{entries[0].companyName}</h3>
                            <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-400">{entries[0].totalCredits.toLocaleString()}</p>
                            <p className="text-sm text-yellow-500/60 font-medium mt-1">Total Verified Credits</p>
                        </div>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        className="order-3"
                        initial={{ opacity: 0, x: 50, y: 50 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden group hover:bg-white/10 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <motion.div
                                className={`w-20 h-20 mx-auto mb-4 rounded-full ${getRankBg(3)} flex items-center justify-center border-2 backdrop-blur-sm`}
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <Medal className="text-orange-400 w-10 h-10" />
                            </motion.div>
                            <div className="text-sm font-bold text-orange-400/80 uppercase tracking-wider mb-2">3rd Place</div>
                            <h3 className="text-xl font-bold text-white mb-2 truncate">{entries[2].companyName}</h3>
                            <p className="text-2xl font-bold text-primary-400">{entries[2].totalCredits.toLocaleString()}</p>
                            <p className="text-sm text-slate-500">Credits Earned</p>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Full Leaderboard Table */}
            {loading ? (
                <motion.div
                    className="flex justify-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </motion.div>
            ) : entries.length === 0 ? (
                <motion.div
                    className="text-center py-20 bg-white/5 rounded-3xl border border-white/10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy size={40} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Leaderboard Empty</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">
                        No companies have earned verified credits for this period yet. Be the first!
                    </p>
                </motion.div>
            ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rank</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Credits</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Badges</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {entries.map((entry, index) => {
                                    const isCurrentUser = user?.walletAddress?.toLowerCase() === entry.walletAddress?.toLowerCase();
                                    return (
                                        <motion.tr
                                            key={entry.companyId}
                                            className={`group transition-colors ${isCurrentUser ? 'bg-primary-500/10 hover:bg-primary-500/20' : 'hover:bg-white/5'
                                                }`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className={`flex items-center gap-3 font-bold text-lg ${getRankColor(entry.rank)}`}>
                                                    {entry.rank <= 3 ? <Trophy size={18} /> : <span className="w-5 text-center text-slate-500">#</span>}
                                                    {entry.rank}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${isCurrentUser ? 'bg-primary-500 text-white' : 'bg-white/10 text-slate-300 group-hover:bg-white/20'
                                                        }`}>
                                                        {entry.companyName.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2">
                                                            {entry.companyName}
                                                            {isCurrentUser && (
                                                                <span className="px-2 py-0.5 rounded-full bg-primary-500/20 border border-primary-500/50 text-xs text-primary-300">You</span>
                                                            )}
                                                            {entry.verified && (
                                                                <span className="text-emerald-400" title="Verified Company">✓</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 font-mono">
                                                            {entry.walletAddress ? `${entry.walletAddress.substring(0, 6)}...${entry.walletAddress.substring(entry.walletAddress.length - 4)}` : 'No Wallet'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <div className="text-lg font-bold text-primary-400 tabular-nums">
                                                    {entry.totalCredits.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right text-slate-300 tabular-nums">
                                                {entry.totalActions.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right text-slate-300 tabular-nums">
                                                {entry.totalBadges.toLocaleString()}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
