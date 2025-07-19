const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name,
    },
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
    },
  };

  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection failed',
        ...healthCheck,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'All systems operational',
      ...healthCheck,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      ...healthCheck,
    });
  }
});

module.exports = router;
