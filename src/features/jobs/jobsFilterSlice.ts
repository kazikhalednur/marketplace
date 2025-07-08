import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JobsFilterState {
  searchText: string;
  selectedTags: string[];
}

const initialState: JobsFilterState = {
  searchText: '',
  selectedTags: [],
};

const jobsFilterSlice = createSlice({
  name: 'jobsFilter',
  initialState,
  reducers: {
    setSearchText(state, action: PayloadAction<string>) {
      state.searchText = action.payload;
    },
    setSelectedTags(state, action: PayloadAction<string[]>) {
      state.selectedTags = action.payload;
    },
    toggleTag(state, action: PayloadAction<string>) {
      if (state.selectedTags.includes(action.payload)) {
        state.selectedTags = state.selectedTags.filter(tag => tag !== action.payload);
      } else {
        state.selectedTags.push(action.payload);
      }
    },
    clearFilters(state) {
      state.searchText = '';
      state.selectedTags = [];
    },
  },
});

export const { setSearchText, setSelectedTags, toggleTag, clearFilters } = jobsFilterSlice.actions;
export default jobsFilterSlice.reducer; 