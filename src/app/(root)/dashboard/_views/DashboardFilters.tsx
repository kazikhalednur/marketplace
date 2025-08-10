import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setSearchText, toggleTag } from '@/features/jobs/jobsFilterSlice';
import { useAppDispatch } from '@/hooks/useTypedDispatch';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { useDebounce } from '@/utils/hooks';
import { TAGS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import FilterModal from './FilterModal';

export default function DashboardFilters() {
  const dispatch = useAppDispatch();
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);
  const [localSearch, setLocalSearch] = useState(searchText);
  
  // Use the useDebounce hook for better search performance
  const debouncedSearch = useDebounce(localSearch, 500);
  
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Debug logging for state changes
  console.log('DashboardFilters render:', { localSearch, debouncedSearch, searchText, selectedTags });

  // Log initial state
  useEffect(() => {
    console.log('DashboardFilters mounted with initial state:', { searchText, selectedTags });
  }, [searchText, selectedTags]);

  // Update search text when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== searchText) {
      console.log('Search triggered:', { debouncedSearch, searchText });
      dispatch(setSearchText(debouncedSearch));
      // No need to call onFiltersChange since we're filtering locally
    }
  }, [debouncedSearch, dispatch, searchText]);

  // Sync local search with global state when it changes externally
  useEffect(() => {
    setLocalSearch(searchText);
  }, [searchText]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setLocalSearch(value);
  }, []);

  const handleFilterApply = useCallback(() => {
    // No need to trigger refetch since we're filtering locally
  }, []);

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
              // No need to call onFiltersChange since we're filtering locally
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
