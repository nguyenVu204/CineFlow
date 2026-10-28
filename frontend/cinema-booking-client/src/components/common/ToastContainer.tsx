import React from 'react';
import { useToast } from '../../context/ToastContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-amber-500/40';
        let iconClass = 'fa-solid fa-bell text-amber-400';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40';
          iconClass = 'fa-solid fa-circle-check text-emerald-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500/40';
          iconClass = 'fa-solid fa-circle-exclamation text-cinema-red';
        }

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto bg-cinema-900 border ${borderClass} text-white shadow-2xl rounded-2xl p-4 flex items-center gap-3 backdrop-blur-xl animate-fade-in cursor-pointer max-w-sm`}
          >
            <i className={`${iconClass} text-lg`}></i>
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};

