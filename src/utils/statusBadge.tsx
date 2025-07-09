import { Check, CheckCircle, Edit, Loader2, Tag, XCircle } from 'lucide-react';
import React from 'react';

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700',
    icon: <Edit className="w-4 h-4" />, bg: 'bg-gray-50'
  },
  open: {
    label: 'Open',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-green-50'
  },
  closed: {
    label: 'Closed',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-4 h-4" />, bg: 'bg-red-50'
  },
  'in progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700',
    icon: <Loader2 className="w-4 h-4 animate-spin" />, bg: 'bg-blue-50'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700',
    icon: <Loader2 className="w-4 h-4 animate-spin" />, bg: 'bg-blue-50'
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-700',
    icon: <Check className="w-4 h-4" />, bg: 'bg-emerald-50'
  },
};

export function getStatusBadge(status?: string, getBg?: boolean): React.ReactNode | string {
  if (!status) return getBg ? 'bg-card' : null;
  const key = status.toLowerCase().replace(/_/g, ' ');
  const map = statusMap[key] || statusMap[status.toLowerCase()] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    color: 'bg-gray-100 text-gray-700',
    icon: <Tag className="w-4 h-4" />, bg: 'bg-gray-50'
  };
  if (getBg) return map.bg;
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm ${map.color}`}
      title={map.label}
    >
      {map.icon} {map.label}
    </span>
  );
} 