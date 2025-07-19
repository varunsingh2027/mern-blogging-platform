const express = require('express');
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

// @route   GET /api/comments/blog/:blogId
// @desc    Get comments for a blog
// @access  Public
router.get('/blog/:blogId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
      blog: req.params.blogId,
      parent: null // Only get top-level comments
    })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ 
      blog: req.params.blogId,
      parent: null 
    });

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', auth, validateComment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { content, blogId, parentId } = req.body;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // If replying to a comment, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      blog: blogId,
      parent: parentId || null
    });

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error while creating comment' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', auth, validateComment, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete comment and all its replies
    await Comment.deleteMany({ 
      $or: [
        { _id: req.params.id },
        { parent: req.params.id }
      ]
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/Unlike a comment
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const existingLike = comment.likes.find(like => like.user.toString() === req.user.id);

    if (existingLike) {
      // Unlike
      comment.likes = comment.likes.filter(like => like.user.toString() !== req.user.id);
    } else {
      // Like
      comment.likes.push({ user: req.user.id });
    }

    await comment.save();

    res.json({
      message: existingLike ? 'Comment unliked' : 'Comment liked',
      likeCount: comment.likes.length,
      hasLiked: !existingLike
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error while liking comment' });
  }
});

// @route   GET /api/comments/:id/replies
// @desc    Get replies for a comment
// @access  Public
router.get('/:id/replies', async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;

    const replies = await Comment.find({ parent: req.params.id })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ parent: req.params.id });

    res.json({
      replies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReplies: total
      }
    });
  } catch (error) {
    console.error('Get replies error:', error);
    res.status(500).json({ message: 'Server error while fetching replies' });
  }
});

module.exports = router;
