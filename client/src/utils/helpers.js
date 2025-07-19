import moment from 'moment';

// Format date utilities
export const formatDate = (date) => {
  return moment(date).format('MMMM DD, YYYY');
};

export const formatDateRelative = (date) => {
  return moment(date).fromNow();
};

export const formatDateTime = (date) => {
  return moment(date).format('MMMM DD, YYYY [at] h:mm A');
};

// Text utilities
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const stripHtml = (html) => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const createExcerpt = (content, maxLength = 200) => {
  const plainText = stripHtml(content);
  return truncateText(plainText, maxLength);
};

// URL utilities
export const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-');
};

// File utilities
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, and GIF files are allowed');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  return true;
};

export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Reading time calculator
export const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const textContent = stripHtml(content);
  const wordCount = textContent.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return readTime;
};

// User utilities
export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const getFullName = (firstName, lastName) => {
  return `${firstName || ''} ${lastName || ''}`.trim();
};

// Local storage utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Array utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password.length >= 6;
};

export const validateUsername = (username) => {
  // 3-20 characters, letters, numbers, underscores only
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
};

// Error handling
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Constants
export const BLOG_CATEGORIES = [
  'Technology',
  'Lifestyle',
  'Travel',
  'Food',
  'Health',
  'Business',
  'Education',
  'Entertainment',
  'Sports',
  'Politics',
  'Science',
  'Other'
];

export const BLOG_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

export const USER_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' }
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];
