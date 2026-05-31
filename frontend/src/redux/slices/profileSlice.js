import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileService from '../../services/profileService';

export const fetchStudentProfile = createAsyncThunk('profile/fetchStudent', async (_, thunkAPI) => {
  try {
    const { data } = await profileService.getStudentProfile();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const fetchStudentProfileById = createAsyncThunk('profile/fetchStudentById', async (id, thunkAPI) => {
  try {
    const { data } = await profileService.getStudentProfileById(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const fetchClientProfileById = createAsyncThunk('profile/fetchClientById', async (id, thunkAPI) => {
  try {
    const { data } = await profileService.getClientProfileById(id);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateStudentProfile = createAsyncThunk('profile/updateStudent', async (profileData, thunkAPI) => {
  try {
    const { data } = await profileService.updateStudentProfile(profileData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const fetchClientProfile = createAsyncThunk('profile/fetchClient', async (_, thunkAPI) => {
  try {
    const { data } = await profileService.getClientProfile();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateClientProfile = createAsyncThunk('profile/updateClient', async (profileData, thunkAPI) => {
  try {
    const { data } = await profileService.updateClientProfile(profileData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update profile');
  }
});

export const uploadAvatar = createAsyncThunk('profile/uploadAvatar', async (formData, thunkAPI) => {
  try {
    const { data } = await profileService.uploadAvatar(formData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
  }
});

export const uploadResume = createAsyncThunk('profile/uploadResume', async (formData, thunkAPI) => {
  try {
    const { data } = await profileService.uploadResume(formData);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to upload resume');
  }
});

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    viewedProfile: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearViewedProfile: (state) => {
      state.viewedProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchStudentProfileById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchStudentProfileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedProfile = action.payload.profile;
      })
      .addCase(fetchStudentProfileById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchClientProfileById.pending, (state) => { state.isLoading = true; })
      .addCase(fetchClientProfileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewedProfile = action.payload.profile;
      })
      .addCase(fetchClientProfileById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.profile = action.payload.profile;
      })
      .addCase(fetchClientProfile.pending, (state) => { state.isLoading = true; })
      .addCase(fetchClientProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.profile;
      })
      .addCase(fetchClientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateClientProfile.fulfilled, (state, action) => {
        state.profile = action.payload.profile;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.user = { ...state.profile.user, avatar: action.payload.avatar };
        }
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.resume = action.payload.resume;
        }
      });
  },
});

export const { clearViewedProfile } = profileSlice.actions;
export default profileSlice.reducer;
