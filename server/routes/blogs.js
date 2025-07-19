const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { auth, optionalAuth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Validation middleware
const validateBlog = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required'),
  body('category')
    .isIn(['Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Business', 'Education', 'Entertainment', 'Sports', 'Politics', 'Science', 'Other'])
    .withMessage('Invalid category'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters')
];

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'blog_images',
        transformation: [
          { width: 1200, height: 630, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// @route   GET /api/blogs
// @desc    Get all published blogs with pagination and filtering
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('search').optional().trim(),
  query('author').optional().isMongoId().withMessage('Invalid author ID'),
  query('sort').optional().isIn(['newest', 'oldest', 'popular', 'trending']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, search, author, sort = 'newest' } = req.query;

    // Build query
    let query = { status: 'published', isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (author) {
      query.author = author;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      case 'popular':
        sortOption = { views: -1, likeCount: -1 };
        break;
      case 'trending':
        // Trending: recent posts with high engagement
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.publishedAt = { $gte: oneWeekAgo };
        sortOption = { views: -1, 'likes.length': -1 };
        break;
      default: // newest
        sortOption = { publishedAt: -1 };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username firstName lastName avatar')
      .populate('commentCount')
      .select('-content') // Don't send full content for list view
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'username firstName lastName avatar bio socialLinks')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      });

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    // Check if user has liked the blog
    let hasLiked = false;
    if (req.user) {
      hasLiked = blog.likes.some(like => like.user.toString() === req.user.id);
    }

    res.json({
      blog: {
        ...blog.toJSON(),
        hasLiked
      }
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', auth, upload.single('featuredImage'), handleMulterError, validateBlog, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, content, excerpt, category, tags, status = 'draft' } = req.body;

    let featuredImage = '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        featuredImage = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Error uploading image' });
      }
    }

    const blog = new Blog({
      title,
      content,
      excerpt: excerpt || content.substring(0, 300) + '...',
      featuredImage,
      author: req.user.id,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status
    });

    await blog.save();
    await blog.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, upload.single('featuredImage'), handleMulterError, validateBlog, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const { title, content, excerpt, category, tags, status } = req.body;

    // Handle image upload if provided
    let featuredImage = blog.featuredImage;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        featuredImage = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(400).json({ message: 'Error uploading image' });
      }
    }

    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt || content.substring(0, 300) + '...';
    blog.featuredImage = featuredImage;
    blog.category = category;
    blog.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    blog.status = status;

    await blog.save();
    await blog.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Blog updated successfully',
      blog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error while updating blog' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user owns the blog or is admin
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ blog: req.params.id });

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
});

// @route   POST /api/blogs/:id/like
// @desc    Like/Unlike a blog
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const existingLike = blog.likes.find(like => like.user.toString() === req.user.id);

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter(like => like.user.toString() !== req.user.id);
    } else {
      // Like
      blog.likes.push({ user: req.user.id });
    }

    await blog.save();

    res.json({
      message: existingLike ? 'Blog unliked' : 'Blog liked',
      likeCount: blog.likes.length,
      hasLiked: !existingLike
    });
  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({ message: 'Server error while liking blog' });
  }
});

// @route   GET /api/blogs/user/:userId
// @desc    Get user's blogs
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ 
      author: req.params.userId, 
      status: 'published' 
    })
      .populate('author', 'username firstName lastName avatar')
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments({ 
      author: req.params.userId, 
      status: 'published' 
    });

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total
      }
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching user blogs' });
  }
});

module.exports = router;
