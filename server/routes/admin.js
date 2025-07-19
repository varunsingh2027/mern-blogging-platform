const express = require('express');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalBlogs,
      totalComments,
      publishedBlogs,
      draftBlogs,
      recentUsers,
      recentBlogs,
      topBloggers
    ] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('username email createdAt'),
      Blog.find().sort({ createdAt: -1 }).limit(5).populate('author', 'username').select('title status createdAt'),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$author', blogCount: { $sum: 1 }, totalViews: { $sum: '$views' } } },
        { $sort: { blogCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'author' } },
        { $unwind: '$author' },
        { $project: { 'author.username': 1, 'author.firstName': 1, 'author.lastName': 1, blogCount: 1, totalViews: 1 } }
      ])
    ]);

    res.json({
      stats: {
        totalUsers,
        totalBlogs,
        totalComments,
        publishedBlogs,
        draftBlogs
      },
      recentActivity: {
        recentUsers,
        recentBlogs,
        topBloggers
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get blog counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const blogCount = await Blog.countDocuments({ author: user._id });
        return {
          ...user.toJSON(),
          blogCount
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   GET /api/admin/blogs
// @desc    Get all blogs with pagination and filtering
// @access  Private (Admin only)
router.get('/blogs', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username firstName lastName email')
      .select('-content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total
      }
    });
  } catch (error) {
    console.error('Admin get blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});

// @route   PUT /api/admin/users/:userId/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:userId/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

// @route   DELETE /api/admin/users/:userId
// @desc    Delete a user and all their content
// @access  Private (Admin only)
router.delete('/users/:userId', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete all user's blogs and comments
    await Blog.deleteMany({ author: req.params.userId });
    await Comment.deleteMany({ author: req.params.userId });

    // Remove user from followers/following lists
    await User.updateMany(
      { $or: [{ followers: req.params.userId }, { following: req.params.userId }] },
      { $pull: { followers: req.params.userId, following: req.params.userId } }
    );

    // Delete the user
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User and all associated content deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// @route   PUT /api/admin/blogs/:blogId/status
// @desc    Update blog status
// @access  Private (Admin only)
router.put('/blogs/:blogId/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.status = status;
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
      blog.isPublished = true;
    } else if (status !== 'published') {
      blog.isPublished = false;
    }

    await blog.save();

    res.json({
      message: `Blog status updated to ${status}`,
      blog
    });
  } catch (error) {
    console.error('Admin update blog status error:', error);
    res.status(500).json({ message: 'Server error while updating blog status' });
  }
});

// @route   DELETE /api/admin/blogs/:blogId
// @desc    Delete a blog and all its comments
// @access  Private (Admin only)
router.delete('/blogs/:blogId', adminAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete all comments for this blog
    await Comment.deleteMany({ blog: req.params.blogId });

    // Delete the blog
    await Blog.findByIdAndDelete(req.params.blogId);

    res.json({ message: 'Blog and all associated comments deleted successfully' });
  } catch (error) {
    console.error('Admin delete blog error:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
});

// @route   GET /api/admin/comments
// @desc    Get all comments with pagination
// @access  Private (Admin only)
router.get('/comments', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const comments = await Comment.find(query)
      .populate('author', 'username firstName lastName email')
      .populate('blog', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total
      }
    });
  } catch (error) {
    console.error('Admin get comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
});

// @route   DELETE /api/admin/comments/:commentId
// @desc    Delete a comment
// @access  Private (Admin only)
router.delete('/comments/:commentId', adminAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Delete comment and all its replies
    await Comment.deleteMany({
      $or: [
        { _id: req.params.commentId },
        { parent: req.params.commentId }
      ]
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Admin delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
});

module.exports = router;
