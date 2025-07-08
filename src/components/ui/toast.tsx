import * as React from 'react';

export interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
  duration?: number;
}

const ICONS = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
  ),
};

export function Toast({ type = 'info', message, onClose, duration = 3500 }: ToastProps) {
  React.useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className="fixed top-6 right-6 z-[9999] w-full max-w-xs sm:max-w-sm bg-white dark:bg-neutral-900 shadow-xl rounded-lg flex items-center px-4 py-3 gap-3 border border-border/60 animate-in fade-in slide-in-from-top-6"
      role="alert"
      aria-live="assertive"
      style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)' }}
    >
      <span className="flex-shrink-0">
        {ICONS[type]}
      </span>
      <span className="flex-1 text-sm text-foreground truncate" title={message}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
} 