import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentService from '../../services/commentService';
import { toast } from 'react-toastify';

// Async thunks
export const getComments = createAsyncThunk(
  'comment/getComments',
  async ({ blogId, params }, { rejectWithValue }) => {
    try {
      const response = await commentService.getComments(blogId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'comment/createComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await commentService.createComment(commentData);
      toast.success('Comment added successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateComment = createAsyncThunk(
  'comment/updateComment',
  async ({ id, content }, { rejectWithValue }) => {
    try {
      const response = await commentService.updateComment(id, content);
      toast.success('Comment updated successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comment/deleteComment',
  async (id, { rejectWithValue }) => {
    try {
      await commentService.deleteComment(id);
      toast.success('Comment deleted successfully!');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const likeComment = createAsyncThunk(
  'comment/likeComment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await commentService.likeComment(id);
      return { id, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
    }
  }
);

export const getReplies = createAsyncThunk(
  'comment/getReplies',
  async ({ commentId, params }, { rejectWithValue }) => {
    try {
      const response = await commentService.getReplies(commentId, params);
      return { commentId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch replies');
    }
  }
);

const initialState = {
  comments: [],
  replies: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
  },
  isLoading: false,
  error: null,
};

const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComments: (state) => {
      state.comments = [];
      state.replies = {};
    },
    updateCommentInList: (state, action) => {
      const { id, updates } = action.payload;
      const commentIndex = state.comments.findIndex(comment => comment._id === id);
      if (commentIndex !== -1) {
        state.comments[commentIndex] = { ...state.comments[commentIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Comments
      .addCase(getComments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.comments = action.payload.comments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create Comment
      .addCase(createComment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false;
        const newComment = action.payload.comment;
        
        if (newComment.parent) {
          // It's a reply
          if (!state.replies[newComment.parent]) {
            state.replies[newComment.parent] = [];
          }
          state.replies[newComment.parent].push(newComment);
        } else {
          // It's a top-level comment
          state.comments.unshift(newComment);
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update Comment
      .addCase(updateComment.fulfilled, (state, action) => {
        const updatedComment = action.payload.comment;
        
        // Update in comments array
        const commentIndex = state.comments.findIndex(comment => comment._id === updatedComment._id);
        if (commentIndex !== -1) {
          state.comments[commentIndex] = updatedComment;
        }
        
        // Update in replies if it's a reply
        Object.keys(state.replies).forEach(parentId => {
          const replyIndex = state.replies[parentId].findIndex(reply => reply._id === updatedComment._id);
          if (replyIndex !== -1) {
            state.replies[parentId][replyIndex] = updatedComment;
          }
        });
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        
        // Remove from comments array
        state.comments = state.comments.filter(comment => comment._id !== commentId);
        
        // Remove from replies
        Object.keys(state.replies).forEach(parentId => {
          state.replies[parentId] = state.replies[parentId].filter(reply => reply._id !== commentId);
        });
        
        // Remove replies of deleted comment
        delete state.replies[commentId];
      })
      // Like Comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const { id, likeCount, hasLiked } = action.payload;
        
        // Update in comments array
        const commentIndex = state.comments.findIndex(comment => comment._id === id);
        if (commentIndex !== -1) {
          state.comments[commentIndex].likeCount = likeCount;
          state.comments[commentIndex].hasLiked = hasLiked;
        }
        
        // Update in replies
        Object.keys(state.replies).forEach(parentId => {
          const replyIndex = state.replies[parentId].findIndex(reply => reply._id === id);
          if (replyIndex !== -1) {
            state.replies[parentId][replyIndex].likeCount = likeCount;
            state.replies[parentId][replyIndex].hasLiked = hasLiked;
          }
        });
      })
      // Get Replies
      .addCase(getReplies.fulfilled, (state, action) => {
        const { commentId, replies } = action.payload;
        state.replies[commentId] = replies;
      });
  },
});

export const { clearError, clearComments, updateCommentInList } = commentSlice.actions;
export default commentSlice.reducer;
