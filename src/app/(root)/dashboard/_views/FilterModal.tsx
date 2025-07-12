import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, DollarSign, Layers, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useTypedDispatch';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { setFilters, clearFilters } from '@/features/jobs/jobsFilterSlice';
import { useGetDropdownsQuery } from '@/features/api/jobsApi';

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', icon: CheckCircle },
  { value: 'in_progress', label: 'In Progress', icon: CheckCircle },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'closed', label: 'Closed', icon: XCircle },
];

export default function FilterModal({ open, onClose, onApply }: FilterModalProps) {
  const dispatch = useAppDispatch();
  const currentFilters = useAppSelector((state) => state.jobsFilter);
  const { data: dropdownsData } = useGetDropdownsQuery();
  
  // Local state for form
  const [filters, setLocalFilters] = useState({
    status: currentFilters.status || '',
    min_budget: currentFilters.min_budget || '',
    max_budget: currentFilters.max_budget || '',
    skills: currentFilters.skills || [],
    category: currentFilters.category || '',
  });

  // Get skills based on selected category
  const getSkillsByCategory = (categoryName: string) => {
    if (!categoryName || !dropdownsData?.categories) return [];
    const selectedCategory = (dropdownsData.categories as Array<{ id: number; name: string; slug: string; skills?: { id: number; name: string; slug: string }[] }>).find((cat) => 
      cat.name === categoryName
    );
    return selectedCategory?.skills || [];
  };

  const skillsForSelectedCategory = getSkillsByCategory(filters.category);

  // Update local state when modal opens
  useEffect(() => {
    if (open) {
      setLocalFilters({
        status: currentFilters.status || '',
        min_budget: currentFilters.min_budget || '',
        max_budget: currentFilters.max_budget || '',
        skills: currentFilters.skills || [],
        category: currentFilters.category || '',
      });
    }
  }, [open, currentFilters]);

  const handleSkillToggle = (skill: string) => {
    setLocalFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s: string) => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCategoryChange = (category: string) => {
    setLocalFilters(prev => ({ 
      ...prev, 
      category
    }));
  };

  const handleApply = () => {
    dispatch(setFilters(filters));
    onApply();
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({
      status: '',
      min_budget: '',
      max_budget: '',
      skills: [],
      category: '',
    });
  };

  const handleReset = () => {
    dispatch(clearFilters());
    handleClear();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-primary">Filter Jobs</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Status */}
            <div className="space-y-3">
              <label className="font-medium text-sm">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((status) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.value}
                      onClick={() => setLocalFilters(prev => ({ 
                        ...prev, 
                        status: prev.status === status.value ? '' : status.value 
                      }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                        filters.status === status.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <label className="font-medium text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              >
                <option value="">All Categories</option>
                {dropdownsData?.categories?.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div className="space-y-3">
              <label className="font-medium text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget Range (৳)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Min Budget"
                  value={filters.min_budget}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, min_budget: e.target.value }))}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max Budget"
                  value={filters.max_budget}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, max_budget: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Skills - Only show when category is selected */}
            {filters.category && (
              <div className="space-y-3">
                <label className="font-medium text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Skills for {filters.category}
                </label>
                {skillsForSelectedCategory.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      {skillsForSelectedCategory.map((skill: { id: number; name: string; slug: string }) => (
                        <button
                          key={skill.id}
                          onClick={() => handleSkillToggle(skill.name)}
                          className={`flex items-center gap-2 p-2 rounded text-sm border transition-colors cursor-pointer ${
                            filters.skills.includes(skill.name)
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-background border-border hover:border-primary/50'
                          }`}
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-3 border border-border rounded-lg">
                    No skills available for this category.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/20">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="cursor-pointer"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="cursor-pointer"
            >
              Reset All
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="cursor-pointer"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 