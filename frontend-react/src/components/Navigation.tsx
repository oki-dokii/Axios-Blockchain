import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Trophy, Award, Home, Shield, TrendingUp, Building, ShoppingBag, Wallet, Menu, X, ChevronDown } from 'lucide-react';
import { ConnectWallet } from './ConnectWallet';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

export function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useUser();

    // Base navigation items
    const allNavItems = [
        { href: "/", label: "Dashboard", icon: Home, roles: ['COMPANY', 'VERIFIER', 'AUDITOR', 'ADMIN'] },
        { href: "/actions", label: "Eco Actions", icon: Leaf, roles: ['COMPANY', 'VERIFIER', 'AUDITOR', 'ADMIN'] },
        { href: "/companies", label: "Companies", icon: Building, roles: ['COMPANY', 'VERIFIER', 'AUDITOR', 'ADMIN'] },
        { href: "/marketplace", label: "Marketplace", icon: ShoppingBag, roles: ['COMPANY'] },
        { href: "/staking", label: "Staking", icon: Wallet, roles: ['COMPANY'] },
        { href: "/governance", label: "Governance", icon: Shield, roles: ['COMPANY', 'AUDITOR'] },
        { href: "/analytics", label: "Analytics", icon: TrendingUp, roles: ['COMPANY', 'VERIFIER', 'AUDITOR', 'ADMIN'] },
        { href: "/leaderboard", label: "Leaderboard", icon: Trophy, roles: ['COMPANY', 'VERIFIER', 'AUDITOR', 'ADMIN'] },
        { href: "/badges", label: "NFT Badges", icon: Award, roles: ['COMPANY'] },
    ];

    // Filter navigation items based on user role
    const navItems = isAuthenticated && user?.role
        ? allNavItems.filter(item => item.roles.includes(user.role!.toUpperCase()))
        : allNavItems.filter(item => item.roles.includes('COMPANY')); // Default for unauthenticated

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-secondary-950/70 backdrop-blur-2xl border-b border-white/5 supports-[backdrop-filter]:bg-secondary-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-secondary-400">
                            EcoLedger
                        </span>
                    </motion.div>

                    <div className="hidden md:flex items-center space-x-1">
                        {/* Primary Items */}
                        {navItems.slice(0, 4).map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                                        isActive
                                            ? "text-white bg-white/10"
                                            : "text-secondary-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", isActive ? "text-primary-400" : "text-secondary-500")} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        {/* More Dropdown */}
                        {navItems.length > 4 && (
                            <div className="relative group">
                                <button className="px-4 py-2 rounded-full text-sm font-medium text-secondary-400 hover:text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2">
                                    <span className="text-secondary-500">More</span>
                                    <ChevronDown className="w-4 h-4 text-secondary-500 group-hover:text-white transition-colors" />
                                </button>

                                <div className="absolute top-full right-0 pt-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto transition-all duration-200">
                                    <div className="bg-secondary-900/90 backdrop-blur-xl border border-white/5 rounded-2xl p-2 shadow-xl min-w-[200px] flex flex-col gap-1">
                                        {navItems.slice(4).map((item) => {
                                            const Icon = item.icon;
                                            const isActive = location.pathname === item.href;
                                            return (
                                                <Link
                                                    key={item.href}
                                                    to={item.href}
                                                    className={cn(
                                                        "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3",
                                                        isActive
                                                            ? "text-white bg-white/10"
                                                            : "text-secondary-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <Icon className={cn("w-4 h-4", isActive ? "text-primary-400" : "text-secondary-500")} />
                                                    {item.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <ConnectWallet />

                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="hidden md:flex items-center px-6 py-2 rounded-full text-sm font-semibold text-secondary-200 border border-white/5 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all backdrop-blur-sm"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="hidden md:flex items-center px-6 py-2 rounded-full text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all transform hover:scale-105 whitespace-nowrap"
                                >
                                    Get Started
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                                className="hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-white/70 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all"
                            >
                                Logout
                            </button>
                        )}

                        <motion.button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-secondary-400 hover:text-white"
                            whileTap={{ scale: 0.9 }}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </motion.button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-secondary-950 border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 text-secondary-400 hover:text-white transition-colors"
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            ))}
                            {!isAuthenticated && (
                                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                    <Link to="/login" className="text-center py-3 rounded-xl bg-white/5 text-white font-bold">
                                        Log In
                                    </Link>
                                    <Link to="/register" className="text-center py-3 rounded-xl bg-primary-500 text-secondary-950 font-bold">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
