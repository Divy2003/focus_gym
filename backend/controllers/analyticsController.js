// controllers/analyticsController.js
const Member = require('../models/Member');
const DietPlan = require('../models/DietPlan');
const moment = require('moment');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Next 7 days window
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Kick off independent queries in parallel to reduce latency
    const [
      totalMembersPromise,
      approvedMembersPromise,
      pendingMembersPromise,
      expiredMembersPromise,
      newMembersThisMonthPromise,
      totalDietPlansPromise,
      expiringMembersCountPromise,
      statusDistributionPromise,
      totalRevenueThisMonthPromise
    ] = [
      Member.countDocuments({ isActive: true }),
      Member.countDocuments({ isActive: true, status: 'approved' }),
      Member.countDocuments({ isActive: true, status: 'pending' }),
      Member.countDocuments({ isActive: true, endingDate: { $lt: today } }),
      Member.countDocuments({ isActive: true, joiningDate: { $gte: startOfMonth, $lte: endOfMonth } }),
      DietPlan.countDocuments({ isActive: true }),
      Member.countDocuments({ isActive: true, endingDate: { $gte: today, $lte: nextWeek }, status: 'approved' }),
      Member.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      // Revenue for members ACTIVE during the current month
      Member.aggregate([
        {
          $match: {
            isActive: true,
            status: 'approved',
            joiningDate: { $lte: endOfMonth },
            endingDate: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, totalRevenue: { $sum: '$fees' } } }
      ])
    ];

    const [
      totalMembers,
      approvedMembers,
      pendingMembers,
      expiredMembers,
      newMembersThisMonth,
      totalDietPlans,
      expiringMembersCount,
      statusDistribution,
      revenueResult
    ] = await Promise.all([
      totalMembersPromise,
      approvedMembersPromise,
      pendingMembersPromise,
      expiredMembersPromise,
      newMembersThisMonthPromise,
      totalDietPlansPromise,
      expiringMembersCountPromise,
      statusDistributionPromise,
      totalRevenueThisMonthPromise
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Monthly statistics for the last 6 months using a single aggregation based on joiningDate
    const sixMonthsAgoStart = moment().subtract(5, 'months').startOf('month').toDate();
    const monthlyAgg = await Member.aggregate([
      {
        $match: {
          isActive: true,
          joiningDate: { $gte: sixMonthsAgoStart, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: { year: { $year: '$joiningDate' }, month: { $month: '$joiningDate' } },
          members: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$fees', 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Map agg results into fixed 6-month window with labels and fill missing months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = moment().subtract(i, 'months').startOf('month');
      const label = mStart.format('MMM YYYY');
      const y = mStart.year();
      const m = mStart.month() + 1; // month() is 0-based
      const hit = monthlyAgg.find(r => r._id.year === y && r._id.month === m);
      monthlyStats.push({
        month: label,
        members: hit ? hit.members : 0,
        revenue: hit ? hit.revenue : 0
      });
    }

    res.status(200).json({
      success: true,
      analytics: {
        totalMembers,
        approvedMembers,
        pendingMembers,
        expiredMembers,
        newMembersThisMonth,
        totalRevenue,
        totalDietPlans,
        expiringMembersCount,
        monthlyStats,
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};

// Get members expiring soon
const getExpiringMembers = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const expiringMembers = await Member.find({
      isActive: true,
      endingDate: { $gte: today, $lte: futureDate },
      status: 'approved'
    }).sort({ endingDate: 1 });

    res.status(200).json({
      success: true,
      expiringMembers
    });
  } catch (error) {
    console.error('Expiring members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expiring members'
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getExpiringMembers
};