import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  role?: string | null;
  email_verified?: boolean | null;
  is_google_login?: boolean | null;
  avatar?: string | null;
  name?: string | null;
}

const initialState: UserState = {
  first_name: null,
  last_name: null,
  email: null,
  username: null,
  phone: null,
  role: null,
  email_verified: null,
  is_google_login: null,
  avatar: null,
  name: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    clearUser(state) {
      state.first_name = null;
      state.last_name = null;
      state.email = null;
      state.username = null;
      state.phone = null;
      state.role = null;
      state.email_verified = null;
      state.is_google_login = null;
      state.avatar = null;
      state.name = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 