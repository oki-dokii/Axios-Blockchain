import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Award, Activity, Calendar, ShoppingBag, Wallet, Trophy } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DashboardChart } from './DashboardChart';
import { RecentActions } from './RecentActions';
import { BlockchainData } from './BlockchainData';
import { BlockchainEventFeed } from './BlockchainEventFeed';
import { useBlockchainEvents } from '../hooks/useBlockchainEvents';
import { api } from '../lib/services/api';

interface User {
    id: string;
    walletAddress: string;
    name: string;
    role?: string;
}

interface CompanyStats {
    totalActions?: number;
    totalCreditsEarned?: number;
}

interface CompanyDashboardProps {
    user: User;
}

interface QuickActionItem {
    id: string;
    title: string;
    description?: string;
    icon?: string;
    route: string;
    isPrimary: boolean;
}

// Helper to get Lucide icon by name
function getIconComponent(iconName?: string): LucideIcon {
    if (!iconName) return Leaf;
    const icons = LucideIcons as unknown as Record<string, LucideIcon>;
    return icons[iconName] || Leaf;
}

export function CompanyDashboard({ user }: CompanyDashboardProps) {
    const [loading, setLoading] = useState(true);
    const { events } = useBlockchainEvents();
    const [stats, setStats] = useState({
        totalCredits: 0,
        totalActions: 0,
        badgesEarned: 0,
        ranking: 0,
        companyStats: null as CompanyStats | null
    });
    const [weeklyData, setWeeklyData] = useState([
        { day: 'Mon', credits: 0 },
        { day: 'Tue', credits: 0 },
        { day: 'Wed', credits: 0 },
        { day: 'Thu', credits: 0 },
        { day: 'Fri', credits: 0 },
        { day: 'Sat', credits: 0 },
        { day: 'Sun', credits: 0 }
    ]);
    const [quickActions, setQuickActions] = useState<QuickActionItem[]>([]);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const overview = await api.getOverview();
            const trends = await api.getTrends(7);

            const newStats = {
                ...stats,
                totalCredits: overview.credits?.totalIssued || 0,
                totalActions: overview.actions?.total || 0
            };

            if (trends.trends && trends.trends.length > 0) {
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const trendMap = new Map(trends.trends.map((t) => {
                    const date = new Date(t.date);
                    return [daysOfWeek[date.getDay()], t.creditsIssued || 0] as [string, number];
                }));

                setWeeklyData(prev => prev.map(item => ({
                    ...item,
                    credits: Number(trendMap.get(item.day)) || 0
                })));
            }

            if (user?.id) {
                try {
                    const companyAnalytics = await api.getCompanyAnalytics(user.id);
                    newStats.companyStats = companyAnalytics.stats || null;
                    newStats.totalActions = companyAnalytics.stats?.totalActions || newStats.totalActions;
                    newStats.totalCredits = companyAnalytics.stats?.totalCredits || newStats.totalCredits;
                } catch (error) {
                    console.error('Failed to load company analytics:', error);
                }
            }
            setStats(newStats);

            // Load quick actions from API
            try {
                const quickActionsResponse = await api.getQuickActions('COMPANY');
                if (quickActionsResponse.success) {
                    setQuickActions(quickActionsResponse.data);
                }
            } catch (quickActionsError) {
                console.error('Failed to load quick actions:', quickActionsError);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, stats]);

    useEffect(() => {
        loadDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Auto-refresh when blockchain events occur
    useEffect(() => {
        if (events.length > 0) {
            loadDashboardData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events.length]);

    const statCards = [
        {
            icon: Leaf,
            label: "Total Credits",
            value: stats.totalCredits.toLocaleString(),
            gradient: "from-emerald-500/20 to-emerald-600/20",
            iconColor: "text-emerald-400",
            borderColor: "border-emerald-500/30"
        },
        {
            icon: Activity,
            label: "Eco Actions",
            value: stats.totalActions,
            gradient: "from-blue-500/20 to-cyan-600/20",
            iconColor: "text-cyan-400",
            borderColor: "border-cyan-500/30"
        },
        {
            icon: Award,
            label: "Badges Earned",
            value: stats.badgesEarned,
            gradient: "from-amber-500/20 to-orange-600/20",
            iconColor: "text-amber-400",
            borderColor: "border-amber-500/30"
        },
        {
            icon: Trophy,
            label: "Ranking",
            value: `#${stats.ranking || 'N/A'}`,
            gradient: "from-purple-500/20 to-pink-600/20",
            iconColor: "text-purple-400",
            borderColor: "border-purple-500/30"
        }
    ];

    return (
        <div className="relative min-h-screen bg-slate-900 overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                className="mb-8 relative z-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <motion.div
                        className="p-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Leaf className="h-8 w-8 text-primary-400" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">Dashboard</span>
                    </h1>
                </div>
                <p className="text-slate-400 text-lg">Track your sustainability efforts and carbon credit rewards</p>
            </motion.div>

            {loading ? (
                <motion.div
                    className="flex justify-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Leaf className="h-6 w-6 text-primary-500 animate-pulse" />
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.label}
                                    className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-white/20 transition-all duration-300`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
                                            <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-xl bg-white/5 border ${stat.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 relative z-10">
                        {/* Chart Section */}
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-primary-400" />
                                        Weekly Carbon Credits
                                    </h3>
                                    <div className="flex items-center text-xs font-medium text-primary-300 bg-primary-500/10 px-3 py-1.5 rounded-full border border-primary-500/20">
                                        <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                        Last 7 days
                                    </div>
                                </div>
                                <div className="min-h-[320px] w-full">
                                    <DashboardChart data={weeklyData} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Actions Feed */}
                        <motion.div
                            className="lg:col-span-1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                            <div className="h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 overflow-hidden">
                                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-400" />
                                    Recent Activity
                                </h3>
                                <RecentActions />
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        className="mt-8 relative z-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-purple-400" />
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {quickActions.length > 0 ? (
                                    quickActions.map((action) => {
                                        const IconComponent = getIconComponent(action.icon);
                                        return (
                                            <motion.div key={action.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Link to={action.route} className={`
                                                    relative group flex items-center justify-center w-full px-6 py-4 rounded-xl font-medium transition-all duration-300
                                                    ${action.isPrimary
                                                        ? 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 border border-transparent'
                                                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'}
                                                `}>
                                                    <IconComponent className="h-5 w-5 mr-3" />
                                                    {action.title}
                                                </Link>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Link to="/actions" className="group flex items-center justify-center w-full px-6 py-4 rounded-xl font-medium bg-gradient-to-r from-primary-600 to-emerald-600 text-white shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all duration-300">
                                                <Leaf className="h-5 w-5 mr-3" />
                                                Log Eco Action
                                            </Link>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Link to="/marketplace" className="group flex items-center justify-center w-full px-6 py-4 rounded-xl font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                                <ShoppingBag className="h-5 w-5 mr-3" />
                                                Marketplace
                                            </Link>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Link to="/staking" className="group flex items-center justify-center w-full px-6 py-4 rounded-xl font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                                <Wallet className="h-5 w-5 mr-3" />
                                                Stake Credits
                                            </Link>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Link to="/leaderboard" className="group flex items-center justify-center w-full px-6 py-4 rounded-xl font-medium bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                                <Trophy className="h-5 w-5 mr-3" />
                                                Leaderboard
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Blockchain Data Feeds (Optional - kept at bottom) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                            <BlockchainData />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            <BlockchainEventFeed maxEvents={5} roleFilter={true} />
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
}

