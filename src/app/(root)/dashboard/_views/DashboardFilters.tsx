import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setSearchText, toggleTag } from '@/features/jobs/jobsFilterSlice';
import { useAppDispatch } from '@/hooks/useTypedDispatch';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { TAGS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import FilterModal from './FilterModal';

interface DashboardFiltersProps {
  onFiltersChange?: () => void;
}

export default function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const dispatch = useAppDispatch();
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);
  const [localSearch, setLocalSearch] = useState(searchText);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Use a ref to store the timeout id with correct type
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    const value = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      dispatch(setSearchText(value));
      onFiltersChange?.(); // Trigger API call with debounced search
    }, 500); // Increased debounce time for better UX
  }, [dispatch, onFiltersChange]);

  const handleFilterApply = useCallback(() => {
    // Trigger refetch when filters are applied
    onFiltersChange?.();
  }, [onFiltersChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search jobs..."
            className="pl-10 pr-4 py-2 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
            value={localSearch}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
          onClick={() => setFilterModalOpen(true)}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </div>
      {/* Tag Filter */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/30"
      >
        {TAGS.map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
            size="sm"
            className={`rounded-full px-4 whitespace-nowrap transition-colors ${selectedTags.includes(tag) ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => {
              dispatch(toggleTag(tag));
              onFiltersChange?.(); // Instant API call for tag changes
            }}
          >
            {tag}
          </Button>
        ))}
      </motion.div>
      
      {/* Filter Modal */}
      <FilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApply={handleFilterApply}
      />
    </motion.div>
  );
}
