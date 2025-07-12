import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JobsFilterState {
  searchText: string;
  selectedTags: string[];
  status: string;
  search: string;
  tags: string[];
  min_budget: string;
  max_budget: string;
  skills: string[];
  category: string;
}

const initialState: JobsFilterState = {
  searchText: '',
  selectedTags: [],
  status: '',
  search: '',
  tags: [],
  min_budget: '',
  max_budget: '',
  skills: [],
  category: '',
};

const jobsFilterSlice = createSlice({
  name: 'jobsFilter',
  initialState,
  reducers: {
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
      state.search = action.payload; // Sync with API field
    },
    setSelectedTags(state, action: PayloadAction<string[]>) {
      state.selectedTags = action.payload;
      state.tags = action.payload; // Sync with API field
    },
    toggleTag(state, action: PayloadAction<string>) {
      if (state.selectedTags.includes(action.payload)) {
        state.selectedTags = state.selectedTags.filter(tag => tag !== action.payload);
      } else {
        state.selectedTags.push(action.payload);
      }
      state.tags = state.selectedTags; // Sync with API field
    },
    setFilters(state, action: PayloadAction<{
      status?: string;
      search?: string;
      tags?: string[];
      min_budget?: string;
      max_budget?: string;
      skills?: string[];
      category?: string;
    }>) {
      if (action.payload.status !== undefined) state.status = action.payload.status;
      if (action.payload.search !== undefined) {
        state.search = action.payload.search;
        state.searchText = action.payload.search; // Sync with UI field
      }
      if (action.payload.tags !== undefined) {
        state.tags = action.payload.tags;
        state.selectedTags = action.payload.tags; // Sync with UI field
      }
      if (action.payload.min_budget !== undefined) state.min_budget = action.payload.min_budget;
      if (action.payload.max_budget !== undefined) state.max_budget = action.payload.max_budget;
      if (action.payload.skills !== undefined) state.skills = action.payload.skills;
      if (action.payload.category !== undefined) state.category = action.payload.category;
    },
    clearFilters(state) {
      state.searchText = '';
      state.selectedTags = [];
      state.status = '';
      state.search = '';
      state.tags = [];
      state.min_budget = '';
      state.max_budget = '';
      state.skills = [];
      state.category = '';
    },
  },
});

export const { setSearchText, setSelectedTags, toggleTag, setFilters, clearFilters } = jobsFilterSlice.actions;
export default jobsFilterSlice.reducer; 