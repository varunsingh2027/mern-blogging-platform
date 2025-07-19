const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { auth } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'user_avatars',
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
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

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -email')
      .populate('followers', 'username firstName lastName avatar')
      .populate('following', 'username firstName lastName avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's published blogs count
    const blogCount = await Blog.countDocuments({ 
      author: user._id, 
      status: 'published' 
    });

    res.json({
      user: {
        ...user.toJSON(),
        blogCount,
        followerCount: user.followers.length,
        followingCount: user.following.length
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('avatar'), handleMulterError, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('socialLinks.twitter')
    .optional()
    .matches(/^@?[A-Za-z0-9_]+$/)
    .withMessage('Invalid Twitter username'),
  body('socialLinks.linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn must be a valid URL'),
  body('socialLinks.github')
    .optional()
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Invalid GitHub username')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, bio, socialLinks } = req.body;

    // Handle avatar upload if provided
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        user.avatar = result.secure_url;
      } catch (uploadError) {
        console.error('Avatar upload error:', uploadError);
        return res.status(400).json({ message: 'Error uploading avatar' });
      }
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      };
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: user.bio,
        socialLinks: user.socialLinks,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow/Unfollow a user
// @access  Private
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const isFollowing = currentUser.following.includes(req.params.userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.userId
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // Follow
      currentUser.following.push(req.params.userId);
      userToFollow.followers.push(req.user.id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? 'User unfollowed successfully' : 'User followed successfully',
      isFollowing: !isFollowing,
      followerCount: userToFollow.followers.length
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error while following user' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(q.trim(), 'i');

    const users = await User.find({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    })
      .select('username firstName lastName avatar bio')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ username: 1 });

    const total = await User.countDocuments({
      $or: [
        { username: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ]
    });

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   GET /api/users/:userId/blogs
// @desc    Get user's published blogs
// @access  Public
router.get('/:userId/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId).select('username firstName lastName');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
      user,
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

// @route   GET /api/users/me/drafts
// @desc    Get current user's draft blogs
// @access  Private
router.get('/me/drafts', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ 
      author: req.user.id, 
      status: 'draft' 
    })
      .select('-content')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments({ 
      author: req.user.id, 
      status: 'draft' 
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
    console.error('Get drafts error:', error);
    res.status(500).json({ message: 'Server error while fetching drafts' });
  }
});

// @route   GET /api/users/me/stats
// @desc    Get current user's statistics
// @access  Private
router.get('/me/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      publishedCount,
      draftCount,
      totalViews,
      totalLikes,
      followerCount,
      followingCount
    ] = await Promise.all([
      Blog.countDocuments({ author: userId, status: 'published' }),
      Blog.countDocuments({ author: userId, status: 'draft' }),
      Blog.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      Blog.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
      ]),
      User.findById(userId).then(user => user.followers.length),
      User.findById(userId).then(user => user.following.length)
    ]);

    res.json({
      stats: {
        publishedBlogs: publishedCount,
        draftBlogs: draftCount,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        followers: followerCount,
        following: followingCount
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching stats' });
  }
});

module.exports = router;
