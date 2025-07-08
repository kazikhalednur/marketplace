"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from './toast';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'onClose'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<(ToastProps & { key: number }) | null>(null);
  const showToast = useCallback((props: Omit<ToastProps, 'onClose'>) => {
    setToast({ ...props, key: Date.now() });
  }, []);
  const handleClose = () => setToast(null);

  // Destructure key so it is not spread into Toast
  const { key, message, ...toastProps } = toast || { key: undefined, message: '' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          key={key}
          message={message}
          {...toastProps}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
}; 