import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Award, Lock, ShieldCheck } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useBlockchain } from '../hooks/useBlockchain';
import { useWallet } from '../contexts/WalletContext';
import { useNotifications } from '../contexts/NotificationContext';
import { api } from '../lib/services/api';

interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    criteria: string;
    earned: boolean;
    earnedAt?: string;
    tokenId?: number;
}

export function Badges() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'earned' | 'available'>('all');
    const { isAuthenticated } = useUser();
    const { address } = useWallet();
    const { addNotification } = useNotifications();
    const { getBadgeBalance, getBadgeTokenId, getBadgeTokenURI, getBadgeOwner } = useBlockchain();

    const loadBadges = useCallback(async () => {
        if (!isAuthenticated || !address) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Load badge definitions from backend
            // This is critical - if this fails, we really can't show much.
            const badgeDefinitions = await api.getBadgeDefinitions(true);

            let ownedTokenIds: number[] = [];

            // Try to get owned badges from blockchain, but don't fail if it's not available
            try {
                const balance = await getBadgeBalance(address);

                // Get all owned token IDs
                for (let i = 0; i < balance; i++) {
                    try {
                        const tokenId = await getBadgeTokenId(address, i);
                        if (tokenId > 0) {
                            ownedTokenIds.push(tokenId);
                        }
                    } catch (error) {
                        console.error(`Failed to get token ID at index ${i}:`, error);
                    }
                }
            } catch (blockchainError) {
                console.warn('Blockchain not available or failed to load balances:', blockchainError);
                // We continue with just backend data if blockchain fails
            }

            // Map badge definitions to our format
            const badgesList: Badge[] = badgeDefinitions.map((def: any) => {
                // Check if user owns this badge by finding matching tokenId
                // For now, we'll check if any owned badge matches the criteria
                // In a real app, this mapping would be more robust (e.g. badgeId -> tokenId on chain)

                // Fallback: Check if the backend says we earned it (from our seed script)
                const backendEarned = def.earned === true;

                const isOwned = ownedTokenIds.length > 0 || backendEarned;
                const ownedTokenId = isOwned && ownedTokenIds.length > 0 ? ownedTokenIds[0] : (def.tokenId || undefined);

                return {
                    id: def.id,
                    name: def.name,
                    description: def.description || '',
                    imageUrl: def.imageUrl || '',
                    criteria: def.criteria || `Requires ${def.creditsRequired} credits`,
                    earned: isOwned,
                    tokenId: ownedTokenId
                };
            });

            // Also create entries for owned badges that might not be in definitions
            for (const tokenId of ownedTokenIds) {
                const alreadyIncluded = badgesList.some(b => b.tokenId === tokenId);
                if (!alreadyIncluded) {
                    try {
                        const tokenURI = await getBadgeTokenURI(tokenId);
                        const owner = await getBadgeOwner(tokenId);

                        badgesList.push({
                            id: `token-${tokenId}`,
                            name: `Badge #${tokenId}`,
                            description: `NFT Badge Token #${tokenId}`,
                            imageUrl: tokenURI,
                            criteria: 'Earned through platform achievements',
                            earned: owner.toLowerCase() === address.toLowerCase(),
                            tokenId
                        });
                    } catch (error) {
                        console.error(`Failed to load badge ${tokenId}:`, error);
                    }
                }
            }

            setBadges(badgesList);
        } catch (error) {
            console.error('Failed to load badges:', error);
            // Only notify error if we couldn't even load definitions (critical failure)
            addNotification('error', 'Failed to load badges content');
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, address, getBadgeBalance, getBadgeTokenId, getBadgeTokenURI, getBadgeOwner, addNotification]);

    useEffect(() => {
        loadBadges();
    }, [loadBadges]);

    const filteredBadges = badges.filter(badge => {
        if (filter === 'earned') return badge.earned;
        if (filter === 'available') return !badge.earned;
        return true;
    });

    const earnedCount = badges.filter(b => b.earned).length;

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
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                        <Award className="h-8 w-8 text-primary-500" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white">NFT Badges</h1>
                </div>
                <p className="mt-2 text-slate-400 text-lg">
                    Earn untradeable NFT badges for your environmental achievements.
                </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award size={64} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Badges</p>
                            <p className="text-2xl font-bold text-white">{badges.length}</p>
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
                        <ShieldCheck size={64} className="text-emerald-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Earned</p>
                            <p className="text-2xl font-bold text-white">{earnedCount}</p>
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
                        <Lock size={64} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                            <Lock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Locked</p>
                            <p className="text-2xl font-bold text-white">{badges.length - earnedCount}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter */}
            <div className="mb-6">
                <div className="inline-flex rounded-xl shadow-lg p-1 bg-white/5 border border-white/10" role="group">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'all'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All Badges
                    </button>
                    <button
                        onClick={() => setFilter('earned')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'earned'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Earned
                    </button>
                    <button
                        onClick={() => setFilter('available')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'available'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Available
                    </button>
                </div>
            </div>

            {/* Badges Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </div>
            ) : filteredBadges.length === 0 ? (
                <motion.div
                    className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Award size={48} className="mx-auto text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No badges found</h3>
                    <p className="text-slate-400">Try adjusting your filter</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBadges.map((badge, index) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border transition-all duration-300 group ${badge.earned
                                ? 'border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20'
                                : 'border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="relative">
                                <div className={`aspect-square flex items-center justify-center relative overflow-hidden ${badge.earned
                                    ? 'bg-gradient-to-br from-emerald-500/20 to-primary-500/20'
                                    : 'bg-gradient-to-br from-slate-800 to-slate-900 group-hover:opacity-80 transition-opacity'
                                    }`}>
                                    {badge.imageUrl ? (
                                        <>
                                            <img
                                                src={badge.imageUrl}
                                                alt={badge.name}
                                                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!badge.earned ? 'grayscale opacity-50' : ''}`}
                                            />
                                            {!badge.earned && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                    <Lock size={48} className="text-white/80" />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        badge.earned ? (
                                            <motion.div
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                            >
                                                <Award size={80} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                            </motion.div>
                                        ) : (
                                            <Lock size={60} className="text-slate-600" />
                                        )
                                    )}

                                    {/* Shine effect */}
                                    {badge.earned && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%] pointer-events-none" />
                                    )}
                                </div>
                                {badge.earned && (
                                    <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold shadow-xl z-10">
                                        EARNED
                                    </div>
                                )}
                            </div>

                            <div className="p-5">
                                <h3 className={`font-bold text-lg mb-2 ${badge.earned ? 'text-white' : 'text-slate-400'}`}>
                                    {badge.name}
                                </h3>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2 h-10">
                                    {badge.description}
                                </p>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="px-2 py-1 rounded bg-white/5 text-slate-500 border border-white/5">
                                        <span className="font-semibold text-slate-400">Req:</span> {badge.criteria}
                                    </div>
                                </div>

                                {badge.earned && (
                                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                                        <span className="text-emerald-400 font-medium">
                                            {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Just Now'}
                                        </span>
                                        {badge.tokenId && (
                                            <span className="text-slate-500 font-mono">
                                                ID: #{badge.tokenId}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
