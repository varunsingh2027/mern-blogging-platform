import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

// Async thunks
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getDashboardStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const getUsers = createAsyncThunk(
  'admin/getUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getUsers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateUserRole(userId, role);
      toast.success(response.message);
      return { userId, role };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user role';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteUser(userId);
      toast.success(response.message);
      return userId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getAdminBlogs = createAsyncThunk(
  'admin/getBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const updateBlogStatus = createAsyncThunk(
  'admin/updateBlogStatus',
  async ({ blogId, status }, { rejectWithValue }) => {
    try {
      const response = await adminService.updateBlogStatus(blogId, status);
      toast.success(response.message);
      return { blogId, status };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update blog status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'admin/deleteBlog',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteBlog(blogId);
      toast.success(response.message);
      return blogId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete blog';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getComments = createAsyncThunk(
  'admin/getComments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminService.getComments(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'admin/deleteComment',
  async (commentId, { rejectWithValue }) => {
    try {
      const response = await adminService.deleteComment(commentId);
      toast.success(response.message);
      return commentId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  dashboardStats: {
    stats: {
      totalUsers: 0,
      totalBlogs: 0,
      totalComments: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
    },
    recentActivity: {
      recentUsers: [],
      recentBlogs: [],
      topBloggers: [],
    },
  },
  users: [],
  blogs: [],
  comments: [],
  pagination: {
    users: { currentPage: 1, totalPages: 1, totalUsers: 0 },
    blogs: { currentPage: 1, totalPages: 1, totalBlogs: 0 },
    comments: { currentPage: 1, totalPages: 1, totalComments: 0 },
  },
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Users
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
        state.pagination.users = action.payload.pagination;
      })
      // Update User Role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload;
        const userIndex = state.users.findIndex(user => user._id === userId);
        if (userIndex !== -1) {
          state.users[userIndex].role = role;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      // Get Blogs
      .addCase(getAdminBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload.blogs;
        state.pagination.blogs = action.payload.pagination;
      })
      // Update Blog Status
      .addCase(updateBlogStatus.fulfilled, (state, action) => {
        const { blogId, status } = action.payload;
        const blogIndex = state.blogs.findIndex(blog => blog._id === blogId);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].status = status;
        }
      })
      // Delete Blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
      })
      // Get Comments
      .addCase(getComments.fulfilled, (state, action) => {
        state.comments = action.payload.comments;
        state.pagination.comments = action.payload.pagination;
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.comments = state.comments.filter(comment => comment._id !== action.payload);
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
