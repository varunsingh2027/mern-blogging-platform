import api from './api';

const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // User management
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users?${queryString}`);
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Blog management
  getBlogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/blogs?${queryString}`);
    return response.data;
  },

  updateBlogStatus: async (blogId, status) => {
    const response = await api.put(`/admin/blogs/${blogId}/status`, { status });
    return response.data;
  },

  deleteBlog: async (blogId) => {
    const response = await api.delete(`/admin/blogs/${blogId}`);
    return response.data;
  },

  // Comment management
  getComments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/comments?${queryString}`);
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/admin/comments/${commentId}`);
    return response.data;
  },
};

export default adminService;
