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

    // Total members count
    const totalMembers = await Member.countDocuments({ isActive: true });
    
    // Approved members count
    const approvedMembers = await Member.countDocuments({ 
      isActive: true, 
      status: 'approved' 
    });
    
    // Pending members count
    const pendingMembers = await Member.countDocuments({ 
      isActive: true, 
      status: 'pending' 
    });
    
    // Expired members count
    const expiredMembers = await Member.countDocuments({ 
      isActive: true, 
      endingDate: { $lt: today }
    });

    // Members joined this month
    const newMembersThisMonth = await Member.countDocuments({
      isActive: true,
      joiningDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Total revenue this month
    const revenueResult = await Member.aggregate([
      {
        $match: {
          isActive: true,
          joiningDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$fees' }
        }
      }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Diet plans count
    const totalDietPlans = await DietPlan.countDocuments({ isActive: true });

    // Members expiring in next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const expiringMembersCount = await Member.countDocuments({
      isActive: true,
      endingDate: { $gte: today, $lte: nextWeek },
      status: 'approved'
    });

    // Monthly statistics for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = moment().subtract(i, 'months').startOf('month').toDate();
      const monthEnd = moment().subtract(i, 'months').endOf('month').toDate();
      
      const monthlyMembers = await Member.countDocuments({
        isActive: true,
        joiningDate: { $gte: monthStart, $lte: monthEnd }
      });

      const monthlyRevenueResult = await Member.aggregate([
        {
          $match: {
            isActive: true,
            joiningDate: { $gte: monthStart, $lte: monthEnd },
            status: 'approved'
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$fees' }
          }
        }
      ]);

      monthlyStats.push({
        month: moment().subtract(i, 'months').format('MMM YYYY'),
        members: monthlyMembers,
        revenue: monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].revenue : 0
      });
    }

    // Status distribution
    const statusDistribution = await Member.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

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