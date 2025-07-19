import api from './api';

const blogService = {
  // Get all blogs with pagination and filtering
  getBlogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/blogs?${queryString}`);
    return response.data;
  },

  // Get single blog by slug
  getBlogBySlug: async (slug) => {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  },

  // Create new blog
  createBlog: async (blogData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(blogData).forEach(key => {
      if (key !== 'featuredImage') {
        formData.append(key, blogData[key]);
      }
    });

    // Append file if exists
    if (blogData.featuredImage) {
      formData.append('featuredImage', blogData.featuredImage);
    }

    const response = await api.post('/blogs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(blogData).forEach(key => {
      if (key !== 'featuredImage') {
        formData.append(key, blogData[key]);
      }
    });

    // Append file if exists
    if (blogData.featuredImage) {
      formData.append('featuredImage', blogData.featuredImage);
    }

    const response = await api.put(`/blogs/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete blog
  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  // Like/Unlike blog
  likeBlog: async (id) => {
    const response = await api.post(`/blogs/${id}/like`);
    return response.data;
  },

  // Get user's blogs
  getUserBlogs: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/blogs/user/${userId}?${queryString}`);
    return response.data;
  },

  // Get user's draft blogs
  getUserDrafts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users/me/drafts?${queryString}`);
    return response.data;
  },

  // Get blog by ID (for editing)
  getBlogById: async (id) => {
    const response = await api.get(`/blogs/edit/${id}`);
    return response.data;
  },
};

export default blogService;
