const User = require('../models/User');
const Task = require('../models/Task');

const getAdminOverview = async (req, res, next) => {
  try {
    const [totalUsers, totalTasks, usersByRole, tasksByStatus, recentUsers, tasks] =
      await Promise.all([
        User.countDocuments(),
        Task.countDocuments(),
        User.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
            },
          },
        ]),
        Task.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),
        User.find()
          .select('name email role createdAt')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Task.find()
          .populate('createdBy', 'name email role')
          .sort({ createdAt: -1 })
          .lean(),
      ]);

    const roleCounts = usersByRole.reduce(
      (counts, item) => ({
        ...counts,
        [item._id]: item.count,
      }),
      { user: 0, admin: 0 }
    );

    const statusCounts = tasksByStatus.reduce(
      (counts, item) => ({
        ...counts,
        [item._id]: item.count,
      }),
      { pending: 0, 'in-progress': 0, completed: 0 }
    );

    res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalTasks,
        usersByRole: roleCounts,
        tasksByStatus: statusCounts,
        recentUsers,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminOverview,
};
