import { useEffect, useState, useCallback } from 'react';
import { Loader2, Building, Search, CheckCircle, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/services/api';
import { useUser } from '../contexts/UserContext';

interface Industry {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}

interface Company {
    id: string;
    name: string;
    industry?: string;
    verified: boolean;
    totalCredits?: number;
    totalActions?: number;
    walletAddress: string;
}

export function Companies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
    const [filterIndustry, setFilterIndustry] = useState<string>('all');
    const [industries, setIndustries] = useState<Industry[]>([]);
    const { user } = useUser();

    const isVerifier = user?.role?.toUpperCase() === 'VERIFIER';
    const isAuditor = user?.role?.toUpperCase() === 'AUDITOR';
    const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

    useEffect(() => {
        loadCompanies();
        loadIndustries();
    }, []);

    async function loadIndustries() {
        try {
            const response = await api.getIndustries();
            if (response.success) {
                setIndustries(response.data);
            }
        } catch (error) {
            console.error('Failed to load industries:', error);
        }
    }

    const filterCompanies = useCallback(() => {
        let filtered = companies;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }

        // Verification filter
        if (filterVerified === 'verified') {
            filtered = filtered.filter(c => c.verified);
        } else if (filterVerified === 'unverified') {
            filtered = filtered.filter(c => !c.verified);
        }

        // Industry filter
        if (filterIndustry !== 'all') {
            filtered = filtered.filter(c => c.industry === filterIndustry);
        }

        setFilteredCompanies(filtered);
    }, [companies, searchTerm, filterVerified, filterIndustry]);

    useEffect(() => {
        filterCompanies();
    }, [filterCompanies]);

    async function loadCompanies() {
        setLoading(true);
        try {
            const response = await api.getCompanies();
            const mappedCompanies: Company[] = (response.data || []).map((c) => ({
                id: c.id,
                name: c.name,
                industry: c.industry,
                verified: c.verified,
                totalCredits: 0,
                totalActions: 0,
                walletAddress: c.walletAddress
            }));
            setCompanies(mappedCompanies);
        } catch (error) {
            console.error('Failed to load companies:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <motion.div
                        animate={{ rotateY: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                    >
                        <Building className="h-8 w-8 text-primary-500" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white">
                        {isAdmin ? 'Company Management' : isVerifier ? 'Company Directory' : isAuditor ? 'Company Audits' : 'Companies'}
                    </h1>
                </div>
                <p className="mt-2 text-slate-400">
                    {isAdmin
                        ? 'Manage and oversee all companies on the platform.'
                        : isVerifier
                            ? 'Browse companies and their eco actions for verification.'
                            : isAuditor
                                ? 'Audit company profiles and compliance status.'
                                : 'Explore companies participating in the EcoLedger ecosystem.'}
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                            <Building size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Companies</p>
                            <p className="text-2xl font-bold text-white">{companies.length}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Verified</p>
                            <p className="text-2xl font-bold text-white">
                                {companies.filter(c => c.verified).length}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                            <Filter size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Showing</p>
                            <p className="text-2xl font-bold text-white">{filteredCompanies.length}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 mb-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search companies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border-white/10 rounded-lg text-white placeholder-slate-500 focus:ring-primary-500 focus:border-primary-500 border focus:outline-none transition-all"
                        />
                    </div>
                    <div>
                        <select
                            value={filterVerified}
                            onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
                            className="w-full px-4 py-2.5 bg-slate-800 border-white/10 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500 border focus:outline-none transition-all"
                        >
                            <option value="all">All Companies</option>
                            <option value="verified">Verified Only</option>
                            <option value="unverified">Unverified Only</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filterIndustry}
                            onChange={(e) => setFilterIndustry(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-800 border-white/10 rounded-lg text-white focus:ring-primary-500 focus:border-primary-500 border focus:outline-none transition-all"
                        >
                            <option value="all">All Industries</option>
                            {industries.map((industry) => (
                                <option key={industry.id} value={industry.name}>
                                    {industry.icon} {industry.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Companies Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                    <Building size={48} className="mx-auto text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-white">No companies found</h3>
                    <p className="text-slate-400 mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map((company, index) => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-primary-500/5 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                                        {company.name}
                                    </h3>
                                    <p className="text-sm text-slate-400 flex items-center gap-2">
                                        {company.industry ? (
                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-white/5">
                                                {company.industry}
                                            </span>
                                        ) : 'Uncategorized'}
                                    </p>
                                </div>
                                {company.verified && (
                                    <div className="bg-emerald-500/20 p-1.5 rounded-full">
                                        <CheckCircle className="text-emerald-400 flex-shrink-0" size={20} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 mb-6 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Credits:</span>
                                    <span className="font-mono font-semibold text-emerald-400">{company.totalCredits || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Eco Actions:</span>
                                    <span className="font-mono font-semibold text-white">{company.totalActions || 0}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <p className="text-xs text-slate-500 font-mono truncate max-w-[150px]" title={company.walletAddress}>
                                    {company.walletAddress.slice(0, 6)}...{company.walletAddress.slice(-4)}
                                </p>
                                <button className="text-xs font-medium text-primary-400 hover:text-primary-300">
                                    View Profile →
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
