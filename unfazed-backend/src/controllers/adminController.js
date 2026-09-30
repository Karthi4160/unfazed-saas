const jwt = require('jsonwebtoken');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

/**
 * POST /api/admin/login
 * Authenticate admin using ADMIN_SECRET from .env
 */
exports.adminLogin = async (req, res) => {
  try {
    const { secret } = req.body;

    if (!process.env.ADMIN_SECRET) {
      return res.status(500).json({ message: 'Admin secret not configured' });
    }

    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: 'Invalid admin secret' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/stats
 * Platform-wide statistics
 */
exports.getPlatformStats = async (req, res) => {
  try {
    const [
      totalTherapists,
      totalClients,
      totalBookings,
      revenueAgg,
      activeTherapists
    ] = await Promise.all([
      Therapist.countDocuments({}),
      Client.countDocuments({}),
      Booking.countDocuments({}),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalPlatformFees: { $sum: '$platformFee' },
            transactionCount: { $sum: 1 }
          }
        }
      ]),
      Therapist.countDocuments({ isActive: true })
    ]);

    const revenue = revenueAgg[0] || {
      totalRevenue: 0,
      totalPlatformFees: 0,
      transactionCount: 0
    };

    res.json({
      success: true,
      stats: {
        totalTherapists,
        activeTherapists,
        totalClients,
        totalBookings,
        totalRevenue: revenue.totalRevenue,
        totalPlatformFees: revenue.totalPlatformFees,
        transactionCount: revenue.transactionCount
      }
    });
  } catch (error) {
    console.error('Platform stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/therapists
 * List all therapists with client count and revenue
 */
exports.listTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find({})
      .select('name email slug subscriptionTier isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      therapists.map(async (t) => {
        const [clientCount, revenueAgg] = await Promise.all([
          Client.countDocuments({ therapistId: t._id, isActive: true }),
          Payment.aggregate([
            { $match: { therapistId: t._id, status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
        ]);

        return {
          ...t,
          clientCount,
          totalRevenue: revenueAgg[0]?.total || 0
        };
      })
    );

    res.json({ success: true, therapists: enriched });
  } catch (error) {
    console.error('List therapists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/revenue-trend
 * Platform revenue across the last 12 months
 */
exports.getRevenueTrend = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          platformFees: { $sum: '$platformFee' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatted = data.map(d => ({
      month: `${months[d._id.month - 1]} ${d._id.year}`,
      revenue: d.revenue,
      platformFees: d.platformFees,
      count: d.count
    }));

    res.json({ success: true, trend: formatted });
  } catch (error) {
    console.error('Revenue trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/admin/recent-activity
 * Latest therapist signups and recent payments
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const [recentTherapists, recentPayments] = await Promise.all([
      Therapist.find({})
        .select('name email createdAt subscriptionTier')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Payment.find({ status: 'paid' })
        .populate('therapistId', 'name email')
        .populate('clientId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      success: true,
      recentTherapists,
      recentPayments
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/admin/therapists/:therapistId/toggle
 * Enable or disable a therapist account
 */
exports.toggleTherapistStatus = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: 'Therapist not found' });

    therapist.isActive = !therapist.isActive;
    await therapist.save();

    res.json({ success: true, isActive: therapist.isActive });
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};