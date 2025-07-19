import api from './api';

const commentService = {
  // Get comments for a blog
  getComments: async (blogId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/comments/blog/${blogId}?${queryString}`);
    return response.data;
  },

  // Create new comment
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  // Update comment
  updateComment: async (id, content) => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  // Like/Unlike comment
  likeComment: async (id) => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  },

  // Get replies for a comment
  getReplies: async (commentId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/comments/${commentId}/replies?${queryString}`);
    return response.data;
  },
};

export default commentService;
