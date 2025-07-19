import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from '../../services/blogService';
import { toast } from 'react-toastify';

// Async thunks
export const getBlogs = createAsyncThunk(
  'blog/getBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogService.getBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const getBlogBySlug = createAsyncThunk(
  'blog/getBlogBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await blogService.getBlogBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Blog not found');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await blogService.createBlog(blogData);
      toast.success('Blog created successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create blog';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, blogData }, { rejectWithValue }) => {
    try {
      const response = await blogService.updateBlog(id, blogData);
      toast.success('Blog updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update blog';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      await blogService.deleteBlog(id);
      toast.success('Blog deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete blog';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const likeBlog = createAsyncThunk(
  'blog/likeBlog',
  async (id, { rejectWithValue }) => {
    try {
      const response = await blogService.likeBlog(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like blog');
    }
  }
);

export const getUserBlogs = createAsyncThunk(
  'blog/getUserBlogs',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const response = await blogService.getUserBlogs(userId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user blogs');
    }
  }
);

export const getUserDrafts = createAsyncThunk(
  'blog/getUserDrafts',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogService.getUserDrafts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch drafts');
    }
  }
);

const initialState = {
  blogs: [],
  userBlogs: [],
  drafts: [],
  currentBlog: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    search: '',
    sort: 'newest',
  },
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    updateBlogInList: (state, action) => {
      const { id, updates } = action.payload;
      const blogIndex = state.blogs.findIndex(blog => blog._id === id);
      if (blogIndex !== -1) {
        state.blogs[blogIndex] = { ...state.blogs[blogIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Blogs
      .addCase(getBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.blogs;
        state.pagination = action.payload.pagination;
      })
      .addCase(getBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Blog by Slug
      .addCase(getBlogBySlug.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBlogBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBlog = action.payload.blog;
      })
      .addCase(getBlogBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs.unshift(action.payload.blog);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedBlog = action.payload.blog;
        state.currentBlog = updatedBlog;
        
        // Update in blogs array
        const blogIndex = state.blogs.findIndex(blog => blog._id === updatedBlog._id);
        if (blogIndex !== -1) {
          state.blogs[blogIndex] = updatedBlog;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete Blog
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter(blog => blog._id !== action.payload);
        state.userBlogs = state.userBlogs.filter(blog => blog._id !== action.payload);
        state.drafts = state.drafts.filter(blog => blog._id !== action.payload);
      })
      // Like Blog
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { id, likeCount, hasLiked } = action.payload;
        
        // Update current blog if it matches
        if (state.currentBlog && state.currentBlog._id === id) {
          state.currentBlog.likeCount = likeCount;
          state.currentBlog.hasLiked = hasLiked;
        }
        
        // Update in blogs array
        const blogIndex = state.blogs.findIndex(blog => blog._id === id);
        if (blogIndex !== -1) {
          state.blogs[blogIndex].likeCount = likeCount;
          state.blogs[blogIndex].hasLiked = hasLiked;
        }
      })
      // Get User Blogs
      .addCase(getUserBlogs.fulfilled, (state, action) => {
        state.userBlogs = action.payload.blogs;
      })
      // Get User Drafts
      .addCase(getUserDrafts.fulfilled, (state, action) => {
        state.drafts = action.payload.blogs;
      });
  },
});

export const { clearError, setFilters, clearCurrentBlog, updateBlogInList } = blogSlice.actions;
export default blogSlice.reducer;
