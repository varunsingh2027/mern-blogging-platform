import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';
import { toast } from 'react-toastify';

// Async thunks
export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (username, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile(username);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'User not found');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      toast.success('Profile updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.followUser(userId);
      toast.success(response.message);
      return { userId, ...response };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to follow user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const getUserStats = createAsyncThunk(
  'user/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const initialState = {
  profile: null,
  stats: {
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0,
    following: 0,
  },
  searchResults: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    updateUserInAuth: (state, action) => {
      // This will be handled by the auth slice
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = { ...state.profile, ...action.payload.user };
      })
      // Follow User
      .addCase(followUser.fulfilled, (state, action) => {
        const { userId, isFollowing, followerCount } = action.payload;
        if (state.profile && state.profile.id === userId) {
          state.profile.followerCount = followerCount;
          state.profile.isFollowing = isFollowing;
        }
      })
      // Search Users
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults = action.payload.users;
      })
      // Get User Stats
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      });
  },
});

export const { clearError, clearProfile, clearSearchResults, updateUserInAuth } = userSlice.actions;
export default userSlice.reducer;
