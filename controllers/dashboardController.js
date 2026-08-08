const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const Service = require("../models/Service");
const Blog = require("../models/Blog");
const Admin = require("../models/Admin");
const Contact = require("../models/Contact");
const TestimonialsMain = require("../models/TestimonialsMain");

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ACTIVITY_MONTHS = 7;

// Count documents grouped by the UTC month they were created in.
// Returns a lookup keyed "YYYY-M" so the caller can fill a fixed month window.
const countByMonth = async (Model, since) => {
  const rows = await Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ]);

  return rows.reduce((acc, r) => {
    acc[`${r._id.y}-${r._id.m}`] = r.count;
    return acc;
  }, {});
};

// Same grouping as countByMonth, but for review cards embedded inside the
// single TestimonialsMain document — each card now carries its own
// createdAt (see models/TestimonialsMain.js), so they're unwound first.
const countReviewsByMonth = async (since) => {
  const rows = await TestimonialsMain.aggregate([
    { $unwind: "$reviewsSection.cards" },
    { $match: { "reviewsSection.cards.createdAt": { $gte: since } } },
    {
      $group: {
        _id: {
          y: { $year: "$reviewsSection.cards.createdAt" },
          m: { $month: "$reviewsSection.cards.createdAt" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return rows.reduce((acc, r) => {
    acc[`${r._id.y}-${r._id.m}`] = r.count;
    return acc;
  }, {});
};

// @desc   Get dashboard stats
// @route  GET /api/dashboard/stats
// @access Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalProjects,
    publishedProjects,
    totalServices,
    totalBlogs,
    publishedBlogs,
    totalTeam,
    totalContacts,
    newContacts,
    testimonialsDoc,
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: "published" }),
    Service.countDocuments({ status: "published" }),
    Blog.countDocuments(),
    Blog.countDocuments({ status: "published" }),
    Admin.countDocuments(),          // totalTeam = all admin users
    Contact.countDocuments(),
    Contact.countDocuments({ status: "new" }),
    TestimonialsMain.findOne().select("reviewsSection.cards").lean(),
  ]);

  // Client reviews live as embedded cards on the single TestimonialsMain doc
  const totalClientReviews = testimonialsDoc?.reviewsSection?.cards?.length || 0;

  // Recent contacts
  const recentContacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name email subject status createdAt");

  // Recent projects
  const recentProjects = await Project.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title category status coverImage createdAt");

  // Monthly activity — client reviews & enquiries over the last 7 months (UTC)
  const now = new Date();
  const windowStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (ACTIVITY_MONTHS - 1), 1)
  );

  const [reviewsByMonth, enquiriesByMonth] = await Promise.all([
    countReviewsByMonth(windowStart),
    countByMonth(Contact, windowStart),
  ]);

  const monthlyActivity = Array.from({ length: ACTIVITY_MONTHS }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (ACTIVITY_MONTHS - 1) + i, 1)
    );
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
    return {
      month: MONTH_LABELS[d.getUTCMonth()],
      clientReviews: reviewsByMonth[key] || 0,
      enquiries: enquiriesByMonth[key] || 0,
    };
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalProjects,
        publishedProjects,
        totalServices,
        totalBlogs,
        publishedBlogs,
        totalTeam,
        totalContacts,
        newContacts,
        totalClientReviews,
      },
      recentContacts,
      recentProjects,
      monthlyActivity,
    },
  });
});

module.exports = { getDashboardStats };
