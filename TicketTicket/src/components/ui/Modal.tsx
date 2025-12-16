'use client';

import { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  preventClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = 'md',
  preventClose = false,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  const handleBackdropClick = () => {
    if (!preventClose && onClose) {
      onClose();
    }
  };

  return (
    <Fragment>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
        onClick={handleBackdropClick}
      />

      {/* Modal 內容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            bg-white rounded-2xl shadow-xl w-full pointer-events-auto animate-slide-up
            max-h-[90vh] overflow-hidden flex flex-col
            ${sizeStyles[size]}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
              {showCloseButton && !preventClose && onClose && (
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}
