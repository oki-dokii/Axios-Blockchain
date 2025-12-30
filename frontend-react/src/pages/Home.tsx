
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Leaf, Globe, Award, TrendingUp, Users, Layers, Lock, Cpu, FileCode, Building } from 'lucide-react';
import { CompanyDashboard } from '../components/CompanyDashboard';
import { VerifierDashboard } from '../components/VerifierDashboard';
import { AuditorDashboard } from '../components/AuditorDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { useUser } from '../contexts/UserContext';

export function Home() {
    const { user, isAuthenticated } = useUser();

    // Determine which dashboard to show based on role
    const renderDashboard = () => {
        if (!user) return null;
        const role = user.role?.toUpperCase();
        switch (role) {
            case 'ADMIN': return <AdminDashboard user={user} />;
            case 'VERIFIER': return <VerifierDashboard user={user} />;
            case 'AUDITOR': return <AuditorDashboard user={user} />;
            case 'COMPANY': default: return <CompanyDashboard user={user} />;
        }
    };

    return (
        <div className="min-h-screen">
            {!isAuthenticated ? (
                <div className="overflow-hidden bg-secondary-950 text-white">
                    {/* Hero Section */}
                    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
                        {/* Background Elements */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-glow/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                            {/* Grid */}
                            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">
                                {/* Text Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="inline-flex items-center px-4 py-2 rounded-full bg-secondary-900 border border-secondary-800 text-primary-400 font-medium text-sm mb-6 shadow-glow"
                                    >
                                        <Leaf className="w-4 h-4 mr-2 text-primary-500" />
                                        <span>Next-Gen Climate Action</span>
                                    </motion.div>

                                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                                        Verify. Trade.<br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-accent-glow text-glow">
                                            Make an Impact.
                                        </span>
                                    </h1>

                                    <p className="text-xl text-secondary-400 mb-10 leading-relaxed max-w-lg">
                                        The decentralized marketplace for carbon credits. Built on Ethereum for transparency, security, and real-world change.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link
                                            to="/register"
                                            className="group relative px-8 py-4 bg-primary-600 rounded-xl font-bold text-white shadow-lg shadow-primary-500/30 overflow-hidden transition-all hover:scale-105 hover:shadow-primary-500/50"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer"></div>
                                            <div className="flex items-center justify-center relative z-10">
                                                <UserPlus className="h-5 w-5 mr-2" />
                                                Start Offsetting
                                            </div>
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="px-8 py-4 rounded-xl font-bold text-white border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300 flex items-center justify-center backdrop-blur-md shadow-lg hover:shadow-primary-500/20"
                                        >
                                            <LogIn className="h-5 w-5 mr-2" />
                                            Sign In
                                        </Link>
                                    </div>
                                </motion.div>

                                {/* Interactive Reference Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="relative flex justify-center"
                                >
                                    <div className="relative w-full max-w-[400px]">
                                        {/* Glow Effect behind card */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] -z-10"></div>

                                        {/* Main Card */}
                                        <motion.div
                                            animate={{ y: [0, -15, 0] }}
                                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                            className="w-full bg-[#0B1120] border border-secondary-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="flex flex-col h-full">
                                                {/* Header Icon */}
                                                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                                                    <Globe className="w-8 h-8 text-white" />
                                                </div>

                                                {/* Card Content */}
                                                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">EcoLedger Protocol</h3>
                                                <p className="text-secondary-400 mb-12 text-sm font-medium">Verifiable On-Chain Carbon Offsets</p>

                                                {/* Stats Rows */}
                                                <div className="space-y-4 mt-auto">
                                                    <div className="bg-secondary-800/50 p-4 rounded-2xl flex items-center justify-between border border-secondary-700/50 backdrop-blur-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
                                                                <TrendingUp className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-secondary-400 font-medium">Market Price</div>
                                                                <div className="font-bold text-white tracking-wide">$1,234.56</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-secondary-800/50 p-4 rounded-2xl flex items-center justify-between border border-secondary-700/50 backdrop-blur-sm">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-accent-glow/10 flex items-center justify-center text-accent-glow">
                                                                <Award className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs text-secondary-400 font-medium">Credits Retired</div>
                                                                <div className="font-bold text-white tracking-wide">50,000+</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Infinite Marquee - Trusted Companies */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-secondary-950 to-transparent z-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-full overflow-hidden py-6 border-t border-white/5 bg-secondary-950/30 backdrop-blur-md z-30">
                            <div className="max-w-7xl mx-auto px-4 mb-4">
                                <p className="text-center text-secondary-500 text-xs font-bold tracking-[0.2em] uppercase">Trusted by Industry Leaders</p>
                            </div>
                            <div className="flex relative">
                                <motion.div
                                    className="flex gap-16 items-center whitespace-nowrap px-8"
                                    animate={{ x: ["0%", "-50%"] }}
                                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                                >
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex gap-16 items-center">
                                            {['Tesla', 'Microsoft', 'Google', 'Amazon', 'Meta', 'Stripe', 'Coinbase', 'Shopify'].map((name, index) => (
                                                <div key={index} className="flex items-center gap-2 text-secondary-400 font-bold text-xl hover:text-white transition-colors cursor-default">
                                                    <Building className="w-6 h-6 opacity-50" />
                                                    <span className="opacity-50">{name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section with Glassmorphism */}
                    <section className="py-12 border-y border-secondary-800 bg-secondary-900/30 backdrop-blur-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                                {[
                                    { label: 'Carbon Offset (Tons)', value: '1,234+', icon: Leaf },
                                    { label: 'Network Hashrate', value: '450 TH/s', icon: Cpu },
                                    { label: 'Active Nodes', value: '500+', icon: Layers },
                                    { label: 'Market Cap', value: '$20M+', icon: CoinsIcon },
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-6 rounded-2xl bg-secondary-900/50 border border-secondary-800 hover:border-primary-500/30 transition-all hover:bg-secondary-800/50"
                                    >
                                        <div className="mx-auto w-12 h-12 bg-secondary-800 rounded-full flex items-center justify-center mb-4 text-primary-400 shadow-lg shadow-primary-500/10">
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</div>
                                        <div className="text-sm text-secondary-400 font-medium uppercase tracking-wider">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-24 relative overflow-hidden bg-secondary-950">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl font-bold text-white mb-4">Why EcoLedger?</h2>
                                <p className="text-lg text-secondary-400 max-w-2xl mx-auto">
                                    Bridging the gap between environmental responsibility and blockchain incentives.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {[
                                    { title: 'Transparent Ledger', desc: 'Immutable records of every ton of carbon offset, verified on-chain.', icon: Globe, color: 'text-blue-400', glow: 'shadow-blue-500/20' },
                                    { title: 'DAO Governance', desc: 'Holders vote on protocol upgrades and verifier whitelisting.', icon: Users, color: 'text-purple-400', glow: 'shadow-purple-500/20' },
                                    { title: 'Gamified Impact', desc: 'Earn NFTs and exclusive badges for reaching sustainability milestones.', icon: Award, color: 'text-amber-400', glow: 'shadow-amber-500/20' }
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -10 }}
                                        className={`p-8 rounded-3xl bg-secondary-900/40 border border-secondary-800 backdrop-blur-sm hover:bg-secondary-900/80 transition-all duration-300 group`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-secondary-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color} shadow-lg ${feature.glow}`}>
                                            <feature.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                        <p className="text-secondary-400 leading-relaxed mb-6">{feature.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Blockchain Tech Section */}
                    <section className="py-24 bg-secondary-900 border-t border-secondary-800 relative">
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                            <div className="text-center mb-16">
                                <div className="inline-flex items-center px-4 py-1 rounded-full bg-secondary-800 border border-secondary-700 text-primary-400 text-xs font-mono uppercase tracking-widest mb-6">
                                    <Cpu className="w-3 h-3 mr-2" />
                                    Technology Stack
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-4">Powered by Advanced Web3</h2>
                            </div>

                            <div className="grid md:grid-cols-4 gap-6">
                                {[
                                    { title: 'Ethereum', desc: 'L1 Security', icon: Layers },
                                    { title: 'Smart Contracts', desc: 'Solidity 0.8+', icon: FileCode },
                                    { title: 'Audit Ready', desc: 'OpenZeppelin', icon: Lock },
                                    { title: 'Token Standards', desc: 'ERC-20 & ERC-721', icon: Cpu }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-secondary-950 p-6 rounded-xl border border-secondary-800 flex items-center space-x-4 hover:border-primary-500/50 hover:shadow-glow transition-all"
                                    >
                                        <div className="p-3 bg-secondary-900 rounded-lg text-primary-500">
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{item.title}</h4>
                                            <p className="text-xs text-secondary-500 uppercase font-mono">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {renderDashboard()}
                </div>
            )}
        </div>
    );
}

// Icon helper
function CoinsIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="8" cy="8" r="6" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
            <path d="M7 6h1v4" />
            <path d="m16.71 13.88.7.71-2.82 2.82" />
        </svg>
    )
}
