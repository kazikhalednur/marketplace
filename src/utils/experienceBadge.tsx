import { Star, User, Award, TrendingUp } from 'lucide-react';
import React from 'react';

const experienceMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  entry: {
    label: 'Entry',
    color: 'bg-blue-100 text-blue-700',
    icon: <User className="w-4 h-4" />,
  },
  intermediate: {
    label: 'Intermediate',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <Star className="w-4 h-4" />,
  },
  expert: {
    label: 'Expert',
    color: 'bg-purple-100 text-purple-700',
    icon: <Award className="w-4 h-4" />,
  },
};

export function getExperienceBadge(level?: string): React.ReactNode | null {
  if (!level) return null;
  const key = level.toLowerCase();
  const map = experienceMap[key] || {
    label: level.charAt(0).toUpperCase() + level.slice(1),
    color: 'bg-gray-100 text-gray-700',
    icon: <TrendingUp className="w-4 h-4" />,
  };
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium shadow-sm ${map.color}`}
      title={map.label}
    >
      {map.icon} {map.label}
    </span>
  );
} 