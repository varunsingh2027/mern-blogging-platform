import api from './api';

const userService = {
  // Get user profile by username
  getUserProfile: async (username) => {
    const response = await api.get(`/users/profile/${username}`);
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(profileData).forEach(key => {
      if (key !== 'avatar' && key !== 'socialLinks') {
        formData.append(key, profileData[key]);
      }
    });

    // Append social links
    if (profileData.socialLinks) {
      Object.keys(profileData.socialLinks).forEach(key => {
        formData.append(`socialLinks.${key}`, profileData.socialLinks[key]);
      });
    }

    // Append file if exists
    if (profileData.avatar) {
      formData.append('avatar', profileData.avatar);
    }

    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Follow/Unfollow user
  followUser: async (userId) => {
    const response = await api.post(`/users/follow/${userId}`);
    return response.data;
  },

  // Search users
  searchUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users/search?${queryString}`);
    return response.data;
  },

  // Get user's blogs
  getUserBlogs: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/users/${userId}/blogs?${queryString}`);
    return response.data;
  },

  // Get current user's statistics
  getUserStats: async () => {
    const response = await api.get('/users/me/stats');
    return response.data;
  },
};

export default userService;
