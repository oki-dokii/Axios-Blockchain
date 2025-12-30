import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, Activity, Users, Leaf } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell } from 'recharts';
import { useUser } from '../contexts/UserContext';

interface TrendDataPoint {
    date: string;
    credits: number;
    actions: number;
}

interface ActionTypeDataPoint {
    name: string;
    value: number;
}

interface TopCompany {
    name: string;
    credits: number;
}

export function Analytics() {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [stats, setStats] = useState({
        totalCredits: 0,
        totalActions: 0,
        totalCompanies: 0,
        growthRate: 0
    });
    const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
    const [actionTypeData, setActionTypeData] = useState<ActionTypeDataPoint[]>([]);
    const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
    const { user } = useUser();

    const isVerifier = user?.role?.toUpperCase() === 'VERIFIER';
    const isAuditor = user?.role?.toUpperCase() === 'AUDITOR';

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    async function loadAnalytics() {
        console.log('Antigravity: Starting loadAnalytics...');
        setLoading(true);
        try {
            const days = timeRange === 'week' ? 7 : timeRange === 'year' ? 365 : 30;
            console.log('Antigravity: Fetching data for days:', days);

            // Use Promise.allSettled to allow partial loading if one endpoint fails
            const results = await Promise.allSettled([
                api.get('/analytics/overview'),
                api.get(`/analytics/trends?days=${days}`),
                api.get('/analytics/action-types'),
                api.get('/leaderboard')
            ]);

            const [overviewResult, trendsResult, typesResult, leaderboardResult] = results;

            // 1. Process Overview Data
            if (overviewResult.status === 'fulfilled') {
                const overviewRes = overviewResult.value as any;
                setStats({
                    totalCredits: overviewRes.credits?.totalIssued || 0,
                    totalActions: overviewRes.actions?.total || 0,
                    totalCompanies: overviewRes.companies?.total || 0,
                    growthRate: 12.5 // Placeholder
                });
            } else {
                console.error('Antigravity: Overview fetch failed', overviewResult.reason);
            }

            // 2. Process Trends Data
            if (trendsResult.status === 'fulfilled') {
                const trendsRes = trendsResult.value as any;
                const mappedTrends = (trendsRes.trends || []).map((t: any) => ({
                    date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    credits: t.creditsIssued,
                    actions: t.totalActions
                }));
                setTrendData(mappedTrends);
            } else {
                console.error('Antigravity: Trends fetch failed', trendsResult.reason);
            }

            // 3. Process Action Types Data
            if (typesResult.status === 'fulfilled') {
                const typesRes = typesResult.value as any;
                const mappedTypes = (typesRes.actionTypes || []).map((t: any) => ({
                    name: t.type,
                    value: t.count
                }));
                setActionTypeData(mappedTypes);
            } else {
                console.error('Antigravity: Action Types fetch failed', typesResult.reason);
                setActionTypeData([]);
            }

            // 4. Process Leaderboard Data
            if (leaderboardResult.status === 'fulfilled') {
                const leaderboardRes = leaderboardResult.value as any;
                // Handle wrapped response { leaderboard: [...] } or array [...]
                const data = leaderboardRes.leaderboard || leaderboardRes || [];
                const mappedLeaderboard = (Array.isArray(data) ? data : []).map((c: any) => ({
                    name: c.name || 'Unknown Company',
                    credits: c.credits || c.totalCredits || 0
                }));
                setTopCompanies(mappedLeaderboard);
            } else {
                console.error('Antigravity: Leaderboard fetch failed', leaderboardResult.reason);
            }

            console.log('Antigravity: Analytics load complete', { results });

        } catch (error) {
            console.error('Antigravity: Critical failure in loadAnalytics:', error);
        } finally {
            setLoading(false);
        }
    }

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isVerifier ? 'Verification Analytics' : isAuditor ? 'Audit Analytics' : 'Platform Analytics'}
                    </h1>
                    <p className="mt-2 text-slate-400">
                        {isVerifier
                            ? 'Track your verification performance and statistics.'
                            : isAuditor
                                ? 'Monitor platform compliance and audit metrics.'
                                : 'Comprehensive insights into platform performance and trends.'}
                    </p>
                </div>

                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                    <option value="week" className="bg-slate-900">Last 7 Days</option>
                    <option value="month" className="bg-slate-900">Last 30 Days</option>
                    <option value="year" className="bg-slate-900">Last Year</option>
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </div>
            ) : (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                    <Leaf size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Total Credits</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalCredits.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Total Actions</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalActions.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Companies</p>
                                    <p className="text-2xl font-bold text-white">{stats.totalCompanies.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Growth Rate</p>
                                    <p className="text-2xl font-bold text-emerald-400">+{stats.growthRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credits Trend Chart */}
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 mb-8">
                        <h2 className="text-lg font-bold text-white mb-6">Credits Over Time</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#94a3b8"
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="credits"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCredits)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Action Types Distribution */}
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-6">Action Types Distribution</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={actionTypeData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {actionTypeData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                                        />
                                        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-2xl font-bold">
                                            {actionTypeData.reduce((acc, curr) => acc + curr.value, 0)}
                                        </text>
                                        <text x="50%" y="50%" dy={20} textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-sm">
                                            Total Actions
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-4">
                                {actionTypeData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-sm text-slate-300">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Companies */}
                        <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
                            <h2 className="text-lg font-bold text-white mb-6">Top Companies</h2>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topCompanies} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                        <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            width={100}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                                        />
                                        <Bar dataKey="credits" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* DEBUG DUMP - REMOVE BEFORE PRODUCTION */}
            <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 mt-8 font-mono text-xs text-red-200 overflow-auto max-h-60 mb-12">
                <h3 className="font-bold text-red-400 mb-2">🕵️‍♂️ ANTIGRAVITY DEBUG CONSOLE</h3>
                <p>API Base: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-bold text-white">Stats State:</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(stats, null, 2)}</pre>
                    </div>
                    <div>
                        <p className="font-bold text-white">Trends State (First 2):</p>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(trendData.slice(0, 2), null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
