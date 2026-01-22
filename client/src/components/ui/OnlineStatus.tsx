import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: Date;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function OnlineStatus({ 
  isOnline, 
  lastSeen, 
  size = 'md', 
  showText = false, 
  className
}: OnlineStatusProps) {
  const getStatusColor = () => {
    if (isOnline) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isOnline) return 'Online';
    if (lastSeen) return `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`;
    return 'Offline';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'rounded-full border-2 border-white dark:border-gray-800 shadow-sm',
        getSizeClasses(),
        getStatusColor(),
        isOnline && 'animate-pulse'
      )} />
      {showText && (
        <span className={cn(
          'text-xs',
          isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        )}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
}

export interface UserOnlineStatusProps {
  username: string;
  isOnline: boolean;
  lastSeen?: Date;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function UserOnlineStatus({ 
  isOnline, 
  lastSeen, 
  size = 'md', 
  showText = false, 
  className 
}: UserOnlineStatusProps) {
  return (
    <OnlineStatus
      isOnline={isOnline}
      lastSeen={lastSeen}
      size={size}
      showText={showText}
      className={className}
    />
  );
} 