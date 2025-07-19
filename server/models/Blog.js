const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  featuredImage: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
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
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 1
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Create slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      + '-' + Date.now();
  }
  
  // Calculate read time based on content
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }
  
  next();
});

// Virtual for like count
blogSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count (will be populated from Comment model)
blogSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  count: true
});

// Ensure virtual fields are serialized
blogSchema.set('toJSON', { virtuals: true });

// Index for search functionality
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ slug: 1 });

module.exports = mongoose.model('Blog', blogSchema);
