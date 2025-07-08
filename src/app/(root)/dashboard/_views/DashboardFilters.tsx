import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setSearchText, toggleTag } from '@/features/jobs/jobsFilterSlice';
import { useAppDispatch } from '@/hooks/useTypedDispatch';
import { useAppSelector } from '@/hooks/useTypedSelector';
import { TAGS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

export default function DashboardFilters() {
  const dispatch = useAppDispatch();
  const { searchText, selectedTags } = useAppSelector((state) => state.jobsFilter);
  const [localSearch, setLocalSearch] = useState(searchText);

  // Use a ref to store the timeout id with correct type
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    const value = e.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      dispatch(setSearchText(value));
    }, 350);
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {/* Search Input */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search jobs..."
          className="pl-10 pr-4 py-2 rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
          value={localSearch}
          onChange={handleSearchChange}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
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
            onClick={() => dispatch(toggleTag(tag))}
          >
            {tag}
          </Button>
        ))}
      </motion.div>
    </motion.div>
  );
}