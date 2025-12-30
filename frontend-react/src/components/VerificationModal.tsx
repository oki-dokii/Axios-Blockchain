import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface ActionItem {
    id: string;
    description?: string;
    actionType?: string;
    estimatedCredits?: number;
    company?: { name: string };
}

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: ActionItem | null;
    onVerify: (approved: boolean, comments: string) => Promise<void>;
}

export function VerificationModal({ isOpen, onClose, action, onVerify }: VerificationModalProps) {
    const [approved, setApproved] = useState<boolean | null>(null);
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { addNotification } = useNotifications();

    const handleSubmit = async () => {
        if (approved === null) {
            addNotification('error', 'Please select approve or reject');
            return;
        }

        console.log('handleSubmit called', { approved, comments, actionId: action?.id });
        setSubmitting(true);

        try {
            console.log('VerificationModal: Starting verification', { approved, comments, action: action?.id });
            await onVerify(approved, comments || '');
            console.log('VerificationModal: Verification successful');
            // Success notification is handled by parent
            handleClose();
        } catch (error) {
            console.error('VerificationModal: Verification error', error);
            const errorMessage = error instanceof Error ? error.message : 'Verification failed';
            addNotification('error', errorMessage);
            setSubmitting(false); // Re-enable button on error
        }
    };

    const handleClose = () => {
        setApproved(null);
        setComments('');
        onClose();
    };

    if (!isOpen || !action) return null;

    if (!isOpen || !action) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-secondary-950/80 backdrop-blur-sm transition-opacity"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                        />
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        {/* Modal Content */}
                        <motion.div
                            className="inline-block align-bottom bg-secondary-900 border border-white/10 rounded-2xl text-left overflow-hidden shadow-2xl shadow-black/50 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full relative z-10"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-white tracking-tight">
                                        Verify Eco Action
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="text-secondary-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Action Details */}
                                <div className="mb-8 space-y-4 bg-secondary-950/50 p-4 rounded-xl border border-white/5">
                                    <div>
                                        <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Description</p>
                                        <p className="text-sm text-secondary-200">{action.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {action.company && (
                                            <div>
                                                <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Company</p>
                                                <p className="text-sm text-secondary-200 font-semibold">{action.company.name}</p>
                                            </div>
                                        )}
                                        {action.estimatedCredits && (
                                            <div>
                                                <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Est. Credits</p>
                                                <p className="text-sm text-primary-400 font-mono font-bold">{action.estimatedCredits}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Approval/Rejection Selection */}
                                <div className="mb-6">
                                    <p className="text-sm font-bold text-white mb-3">Your Decision</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setApproved(true);
                                            }}
                                            disabled={submitting}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${submitting
                                                ? 'opacity-50 cursor-not-allowed'
                                                : approved === true
                                                    ? 'border-green-500 bg-green-500/10'
                                                    : 'border-white/5 bg-secondary-950 hover:border-green-500/50 hover:bg-green-500/5'
                                                }`}
                                        >
                                            <CheckCircle2 className={`h-8 w-8 ${approved === true ? 'text-green-500' : 'text-secondary-600'
                                                }`} />
                                            <span className={`font-bold ${approved === true ? 'text-green-400' : 'text-secondary-400'
                                                }`}>Approve</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setApproved(false);
                                            }}
                                            disabled={submitting}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${submitting
                                                ? 'opacity-50 cursor-not-allowed'
                                                : approved === false
                                                    ? 'border-red-500 bg-red-500/10'
                                                    : 'border-white/5 bg-secondary-950 hover:border-red-500/50 hover:bg-red-500/5'
                                                }`}
                                        >
                                            <XCircle className={`h-8 w-8 ${approved === false ? 'text-red-500' : 'text-secondary-600'
                                                }`} />
                                            <span className={`font-bold ${approved === false ? 'text-red-400' : 'text-secondary-400'
                                                }`}>Reject</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Comments */}
                                <div className="mb-6">
                                    <label htmlFor="comments" className="block text-sm font-medium text-secondary-400 mb-2">
                                        Comments (Optional)
                                    </label>
                                    <textarea
                                        id="comments"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        rows={3}
                                        className="w-full bg-secondary-950 border border-white/10 rounded-xl text-white placeholder-secondary-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm p-3 transition-all"
                                        placeholder="Add context to your decision..."
                                    />
                                </div>
                            </div>

                            <div className="bg-secondary-950/50 px-4 py-4 sm:px-6 flex flex-row-reverse gap-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting || approved === null}
                                    className={`w-full inline-flex justify-center items-center rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all sm:w-auto ${approved === null || submitting
                                        ? 'bg-secondary-800 cursor-not-allowed text-secondary-500'
                                        : approved
                                            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-500/20'
                                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Submitting...
                                        </>
                                    ) : approved === null ? (
                                        'Select Decision'
                                    ) : (
                                        `Confirm ${approved ? 'Approval' : 'Rejection'}`
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={submitting}
                                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-sm font-bold text-secondary-300 hover:bg-white/10 hover:text-white transition-all sm:mt-0 sm:w-auto"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

