const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getPlatformStats,
  listTherapists,
  toggleTherapistStatus,
  getRevenueTrend,
  getRecentActivity
} = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/admin');

router.post('/login', adminLogin);

router.get('/stats', protectAdmin, getPlatformStats);
router.get('/therapists', protectAdmin, listTherapists);
router.get('/revenue-trend', protectAdmin, getRevenueTrend);
router.get('/recent-activity', protectAdmin, getRecentActivity);
router.patch('/therapists/:therapistId/toggle', protectAdmin, toggleTherapistStatus);

module.exports = router;