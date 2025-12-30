import { useEffect, useState, useCallback } from 'react';
import { Loader2, Plus, Vote, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useBlockchain } from '../hooks/useBlockchain';
import { useWallet } from '../contexts/WalletContext';
import { useNotifications } from '../contexts/NotificationContext';
import { ethers } from 'ethers';

interface Proposal {
    id: number;
    description: string;
    proposer: string;
    votesFor: bigint;
    votesAgainst: bigint;
    deadline: bigint;
    executed: boolean;
    status: string;
}

export function Governance() {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [votingId, setVotingId] = useState<number | null>(null);
    const [executingId, setExecutingId] = useState<number | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { isAuthenticated } = useUser();
    const { address } = useWallet();
    const { addNotification } = useNotifications();
    const {
        getProposalCount,
        getProposal,
        createProposal,
        voteOnProposal,
        executeProposal,
        hasVoted
    } = useBlockchain();

    const [description, setDescription] = useState('');
    const [targetAddress, setTargetAddress] = useState('');
    const [proposalData, setProposalData] = useState('');

    const loadProposals = useCallback(async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Check if contract is available
            try {
                const count = await getProposalCount();
                const proposalsList: Proposal[] = [];

                // Load all proposals
                for (let i = 1; i <= count; i++) {
                    try {
                        const proposal = await getProposal(i);
                        if (proposal) {
                            const deadline = Number(proposal.deadline) * 1000; // Convert to milliseconds
                            const now = Date.now();
                            const isActive = now < deadline && !proposal.executed;
                            const hasPassed = Number(proposal.votesFor) > Number(proposal.votesAgainst) && now >= deadline;

                            proposalsList.push({
                                id: i,
                                description: proposal.description,
                                proposer: proposal.proposer,
                                votesFor: proposal.votesFor,
                                votesAgainst: proposal.votesAgainst,
                                deadline: proposal.deadline,
                                executed: proposal.executed,
                                status: proposal.executed
                                    ? 'Executed'
                                    : hasPassed
                                        ? 'Passed'
                                        : isActive
                                            ? 'Active'
                                            : Number(proposal.votesAgainst) >= Number(proposal.votesFor)
                                                ? 'Rejected'
                                                : 'Ended'
                            });
                        }
                    } catch (error) {
                        console.error(`Failed to load proposal ${i}:`, error);
                    }
                }

                // Sort by ID descending (newest first)
                proposalsList.sort((a, b) => b.id - a.id);
                setProposals(proposalsList);
            } catch (blockchainError) {
                console.warn('Governance contract not accessible:', blockchainError);
                // Graceful fallback for demo/UI purposes if chain is not ready
                setProposals([]);
            }
        } catch (error) {
            console.error('Failed to load proposals:', error);
            // Don't show critical error for optional blockchain feature
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, getProposalCount, getProposal, addNotification]);

    useEffect(() => {
        loadProposals();
    }, [loadProposals]);

    function getStatusColor(status: string) {
        switch (status) {
            case 'Active':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Passed':
                return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'Rejected':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'Executed':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    }

    function formatTimeRemaining(deadline: bigint) {
        const deadlineMs = Number(deadline) * 1000; // Convert from seconds to milliseconds
        const now = Date.now();
        if (now > deadlineMs) return 'Ended';

        const diff = deadlineMs - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        return `${hours}h remaining`;
    }

    async function handleCreateProposal() {
        if (!description.trim()) {
            addNotification('error', 'Please enter a proposal description');
            return;
        }

        setCreating(true);
        try {
            const target = targetAddress || '0x0000000000000000000000000000000000000000'; // Default to zero address if not provided
            const data = proposalData || '';

            await createProposal(description, target, data);
            addNotification('success', 'Proposal created successfully');
            setDescription('');
            setTargetAddress('');
            setProposalData('');
            setShowCreateModal(false);
            await loadProposals();
        } catch (error) {
            console.error('Failed to create proposal:', error);
            addNotification('error', 'Failed to create proposal');
        } finally {
            setCreating(false);
        }
    }

    async function handleVote(proposalId: number, support: boolean) {
        if (!address) {
            addNotification('error', 'Please connect your wallet to vote');
            return;
        }

        setVotingId(proposalId);
        try {
            const alreadyVoted = await hasVoted(proposalId, address);
            if (alreadyVoted) {
                addNotification('error', 'You have already voted on this proposal');
                return;
            }

            await voteOnProposal(proposalId, support);
            addNotification('success', `Voted ${support ? 'For' : 'Against'} proposal #${proposalId}`);
            await loadProposals();
        } catch (error) {
            console.error('Failed to vote:', error);
            addNotification('error', 'Failed to submit vote');
        } finally {
            setVotingId(null);
        }
    }

    async function handleExecute(proposalId: number) {
        setExecutingId(proposalId);
        try {
            await executeProposal(proposalId);
            addNotification('success', 'Proposal executed successfully');
            await loadProposals();
        } catch (error) {
            console.error('Failed to execute proposal:', error);
            addNotification('error', 'Failed to execute proposal');
        } finally {
            setExecutingId(null);
        }
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
                    <h1 className="text-3xl font-bold text-white">Governance</h1>
                    <p className="mt-2 text-slate-400">
                        Vote on proposals to shape the future of EcoLedger.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={20} />
                    New Proposal
                </motion.button>
            </motion.div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 size={40} className="animate-spin text-primary-500" />
                </div>
            ) : proposals.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
                >
                    <Vote size={48} className="mx-auto text-slate-500 mb-4" />
                    <h3 className="text-xl font-medium text-white">No proposals yet</h3>
                    <p className="text-slate-400 mt-1">Be the first to create a proposal!</p>
                </motion.div>
            ) : (
                <div className="grid gap-6">
                    {proposals.map((proposal, index) => {
                        const votesForNum = Number(proposal.votesFor);
                        const votesAgainstNum = Number(proposal.votesAgainst);
                        const totalVotes = votesForNum + votesAgainstNum;
                        const forPercentage = totalVotes > 0 ? (votesForNum / totalVotes) * 100 : 0;
                        const againstPercentage = totalVotes > 0 ? (votesAgainstNum / totalVotes) * 100 : 0;
                        const votesForFormatted = ethers.formatEther(proposal.votesFor);
                        const votesAgainstFormatted = ethers.formatEther(proposal.votesAgainst);

                        return (
                            <motion.div
                                key={proposal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-800 p-2 rounded-lg text-white font-mono font-bold">
                                            #{proposal.id}
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                                            {proposal.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                                        <Clock size={16} className="mr-2" />
                                        {formatTimeRemaining(proposal.deadline)}
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {proposal.description}
                                </h3>

                                <div className="flex items-center text-sm text-slate-400 mb-6">
                                    <span className="mr-2">Proposer:</span>
                                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-primary-400 border border-white/5">
                                        {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                                    </span>
                                </div>

                                {/* Voting Progress */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-emerald-400 flex items-center gap-1">
                                                <CheckCircle size={14} /> For
                                            </span>
                                            <span className="text-slate-400">{parseFloat(votesForFormatted).toFixed(2)} Votes</span>
                                        </div>
                                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${forPercentage}%` }}
                                                className="bg-emerald-500 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="font-medium text-red-400 flex items-center gap-1">
                                                <XCircle size={14} /> Against
                                            </span>
                                            <span className="text-slate-400">{parseFloat(votesAgainstFormatted).toFixed(2)} Votes</span>
                                        </div>
                                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${againstPercentage}%` }}
                                                className="bg-red-500 h-3 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {proposal.status === 'Active' ? (
                                    <div className="flex gap-4 pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleVote(proposal.id, true)}
                                            className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg px-4 py-3 flex justify-center items-center gap-2 transition-all font-medium"
                                            disabled={votingId === proposal.id || !address}
                                        >
                                            {votingId === proposal.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle size={18} />
                                                    Vote For
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleVote(proposal.id, false)}
                                            className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-3 flex justify-center items-center gap-2 transition-all font-medium"
                                            disabled={votingId === proposal.id || !address}
                                        >
                                            {votingId === proposal.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <XCircle size={18} />
                                                    Vote Against
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : proposal.status === 'Passed' && !proposal.executed ? (
                                    <div className="pt-4 border-t border-white/10">
                                        <button
                                            onClick={() => handleExecute(proposal.id)}
                                            disabled={executingId === proposal.id || !address}
                                            className="w-full bg-purple-600 text-white hover:bg-purple-700 rounded-lg px-4 py-3 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 font-medium"
                                        >
                                            {executingId === proposal.id ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Executing...
                                                </>
                                            ) : (
                                                'Execute Proposal'
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-white/10 text-center text-slate-500 text-sm">
                                        {proposal.executed ? 'Proposal has been executed' : 'Voting has ended'}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create Proposal Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                            onClick={() => setShowCreateModal(false)}
                        />

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block align-bottom bg-slate-900 rounded-2xl border border-white/10 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
                        >
                            <div className="px-6 pt-5 pb-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">
                                        Create New Proposal
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                                            Description *
                                        </label>
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                            className="block w-full bg-slate-800 border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border"
                                            placeholder="Describe what this proposal aims to achieve..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="target" className="block text-sm font-medium text-slate-300 mb-1">
                                            Target Address (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="target"
                                            value={targetAddress}
                                            onChange={(e) => setTargetAddress(e.target.value)}
                                            className="block w-full bg-slate-800 border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border font-mono"
                                            placeholder="0x..."
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="data" className="block text-sm font-medium text-slate-300 mb-1">
                                            Calldata (Optional)
                                        </label>
                                        <textarea
                                            id="data"
                                            value={proposalData}
                                            onChange={(e) => setProposalData(e.target.value)}
                                            rows={2}
                                            className="block w-full bg-slate-800 border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-4 py-3 border font-mono"
                                            placeholder="0x..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={handleCreateProposal}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:w-auto sm:text-sm disabled:opacity-50"
                                    disabled={creating || !address}
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        'Create Proposal'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-white/10 shadow-sm px-4 py-2 bg-slate-800 text-base font-medium text-slate-300 hover:bg-slate-700 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
