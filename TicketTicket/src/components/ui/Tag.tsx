'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { TicketType } from '@/types';
import { AlertTriangle } from 'lucide-react';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'orange' | 'green';
  size?: 'sm' | 'md';
}

const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ className = '', variant = 'default', size = 'sm', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-gray-100 text-gray-700',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      green: 'bg-green-100 text-green-800',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';

// 票券類型標籤元件
interface TicketTypeTagProps {
  type: TicketType;
  showWarning?: boolean;
  size?: 'sm' | 'md';
}

export function TicketTypeTag({ type, showWarning = false, size = 'sm' }: TicketTypeTagProps) {
  const t = useTranslations('ticketType');

  const getLabel = () => {
    switch (type) {
      case 'find_companion': return t('findCompanion');
      case 'main_ticket_transfer': return t('mainTicketTransfer');
      case 'sub_ticket_transfer': return t('subTicketTransfer');
      case 'ticket_exchange': return t('ticketExchange');
    }
  };

  const variantMap: Record<TicketType, TagProps['variant']> = {
    find_companion: 'info',
    main_ticket_transfer: 'purple',
    sub_ticket_transfer: 'green',
    ticket_exchange: 'orange',
  };

  // All types have warnings now
  const hasWarning = true;

  return (
    <div className="inline-flex items-center gap-1">
      <Tag variant={variantMap[type]} size={size}>
        {getLabel()}
      </Tag>
      {showWarning && hasWarning && (
        <AlertTriangle className="w-4 h-4 text-orange-500" />
      )}
    </div>
  );
}

export default Tag;
