import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FreelancerSubProfile } from './api/apiSlice';

export interface UserState {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  username?: string | null;
  phone?: string | null;
  role?: string | null;
  email_verified?: boolean | null;
  is_google_login?: boolean | null;
  student_id?: string | null;
  freelancer_sub_profiles?: FreelancerSubProfile[] | null;
  avatar?: string | null;
  name?: string | null;
  company_name?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  about?: string | null;
  is_payment_verified?: boolean | null;
  is_phone_verified?: boolean | null;
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
  student_id: null,
  freelancer_sub_profiles: null,
  avatar: null,
  name: null,
  company_name: null,
  linkedin: null,
  twitter: null,
  about: null,
  is_payment_verified: null,
  is_phone_verified: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      // Log the incoming data for debugging
      console.log('Setting user data:', action.payload);
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
      state.student_id = null;
      state.freelancer_sub_profiles = null;
      state.avatar = null;
      state.name = null;
      state.company_name = null;
      state.linkedin = null;
      state.twitter = null;
      state.about = null;
      state.is_payment_verified = null;
      state.is_phone_verified = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer; 