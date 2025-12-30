import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { api } from '../lib/services/api';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';

interface Listing {
    id: string;
    amount: number;
    pricePerCredit: string;
    totalPrice: string;
    listingId?: number;
    seller: {
        name: string;
        walletAddress: string;
        verified: boolean;
    };
}

export function Marketplace() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingListing, setCreatingListing] = useState(false);
    const [buyingListingId, setBuyingListingId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user, isAuthenticated } = useUser();
    const { addNotification } = useNotifications();

    const isCompany = user?.role?.toUpperCase() === 'COMPANY';

    const [amount, setAmount] = useState(1);
    const [pricePerCredit, setPricePerCredit] = useState('0.01');

    useEffect(() => {
        if (isCompany || !isAuthenticated) {
            loadListings();
        }
    }, [isCompany, isAuthenticated]);

    async function loadListings() {
        setLoading(true);
        try {
            const response = await api.getListings(1, 50, 'ACTIVE');
            setListings(response.listings || []);
        } catch (error) {
            console.error('Failed to load listings:', error);
            addNotification('error', 'Failed to load listings');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateListing() {
        if (!amount || amount <= 0) {
            addNotification('error', 'Please enter a valid amount');
            return;
        }

        setCreatingListing(true);
        try {
            const totalPrice = (amount * parseFloat(pricePerCredit || '0')).toFixed(4);
            await api.createListing({
                amount,
                pricePerCredit,
                totalPrice,
                status: 'ACTIVE'
            });
            addNotification('success', 'Listing created successfully!');
            setShowCreateModal(false);
            loadListings();
            setAmount(1);
            setPricePerCredit('0.01');
        } catch (error) {
            console.error('Failed to create listing:', error);
            addNotification('error', 'Failed to create listing');
        } finally {
            setCreatingListing(false);
        }
    }

    async function handleBuyListing(listing: Listing) {
        setBuyingListingId(listing.id);
        try {
            // Placeholder: Backend doesn't have a buy endpoint yet, or it's blockchain only.
            // For now, we simulate a buy or show a "Coming Soon" notification 
            // OR if there was logic, we'd put it here.
            // Since User requested "Listing and Buying", and I see no API, 
            // I will assume for this demo we might interact with blockchain later.
            // For now, I'll show a message.
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
            addNotification('info', 'Blockchain purchase integration coming soon!');
        } catch (error) {
            console.error('Failed to buy listing:', error);
            addNotification('error', 'Failed to buy listing');
        } finally {
            setBuyingListingId(null);
        }
    }

    function isOwner(listing: Listing) {
        return user?.walletAddress?.toLowerCase() === listing.seller.walletAddress.toLowerCase();
    }

    // Show access denied for non-company users
    if (isAuthenticated && !isCompany) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-16">
                    <ShoppingCart className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Restricted</h2>
                    <p className="text-secondary-600">
                        The marketplace is only available to companies. Your role: {user?.role}
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
                            <Sparkles className="h-8 w-8 text-primary-500" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-white">Carbon Credit Marketplace</h1>
                    </div>
                    <p className="mt-2 text-slate-400 text-lg">
                        Buy and sell verified carbon credits directly on the blockchain.
                    </p>
                </div>

                <motion.button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all"
                    onClick={() => setShowCreateModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus size={20} />
                    Create Listing
                </motion.button>
            </motion.div>

            {loading ? (
                <motion.div
                    className="flex justify-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </motion.div>
            ) : listings.length === 0 ? (
                <motion.div
                    className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ShoppingCart size={48} className="mx-auto text-slate-500 mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-white mb-2">No active listings</h3>
                    <p className="text-slate-400">Be the first to list your carbon credits!</p>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {listings.map((listing, index) => (
                            <motion.div
                                key={listing.id}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-colors group relative"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                whileHover={{ y: -5 }}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1">
                                                {listing.amount} Credits
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <span>by {listing.seller.name}</span>
                                                {listing.seller.verified && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                        ✓ Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-emerald-400">
                                                {parseFloat(listing.totalPrice).toFixed(4)} ETH
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {listing.pricePerCredit} ETH / credit
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">
                                            ID: #{listing.listingId || 'PENDING'}
                                        </div>

                                        {isOwner(listing) ? (
                                            <motion.button
                                                className="px-4 py-2 text-sm border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Cancel
                                            </motion.button>
                                        ) : (
                                            <motion.button
                                                className="px-6 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg shadow-lg hover:bg-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={buyingListingId === listing.id}
                                                onClick={() => handleBuyListing(listing)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {buyingListingId === listing.id ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin inline mr-2" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Buy Now'
                                                )}
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Listing Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowCreateModal(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <h3 className="text-xl font-bold text-white mb-6">Create New Listing</h3>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Amount (Credits)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            min="1"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                                        />
                                        <div className="absolute right-4 top-3 text-slate-500 text-sm pointer-events-none">CCT</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">
                                        Price per Credit (ETH)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={pricePerCredit}
                                            onChange={(e) => setPricePerCredit(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder-slate-600"
                                        />
                                        <div className="absolute right-4 top-3 text-slate-500 text-sm pointer-events-none">ETH</div>
                                    </div>
                                </div>
                                <div className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-primary-200">Total Price</span>
                                        <span className="text-xl font-bold text-primary-400">
                                            {(amount * parseFloat(pricePerCredit || '0')).toFixed(4)} ETH
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creatingListing}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20"
                                    onClick={handleCreateListing}
                                    disabled={creatingListing}
                                >
                                    {creatingListing ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        'Create Listing'
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
