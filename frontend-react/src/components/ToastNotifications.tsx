
import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle
};

const colors = {
    success: 'bg-secondary-900/90 border-l-4 border-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.15)] backdrop-blur-xl',
    error: 'bg-secondary-900/90 border-l-4 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-xl',
    info: 'bg-secondary-900/90 border-l-4 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-xl',
    warning: 'bg-secondary-900/90 border-l-4 border-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.15)] backdrop-blur-xl'
};

const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400'
};

export function ToastNotifications() {
    const { notifications, removeNotification } = useNotifications();

    return (
        <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {notifications.map((notification) => {
                const Icon = icons[notification.type];
                return (
                    <div
                        key={notification.id}
                        className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border border-white/5 shadow-2xl animate-in slide-in-from-right-full fade-in duration-300 pointer-events-auto",
                            colors[notification.type]
                        )}
                        role="alert"
                    >
                        <div className={cn("p-2 rounded-full bg-white/5 flex-shrink-0", iconColors[notification.type])}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-0.5">
                            <p className="text-sm font-semibold tracking-wide">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="flex-shrink-0 text-secondary-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                            aria-label="Close notification"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
