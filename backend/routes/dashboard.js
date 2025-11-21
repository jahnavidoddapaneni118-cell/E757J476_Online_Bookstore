const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /dashboard/stats
// @desc    Get dashboard statistics for visualization
// @access  Private (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get basic counts
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
        (SELECT COUNT(*) FROM books) as total_books,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT COUNT(*) FROM categories) as total_categories,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') as total_revenue
    `;

    // Get monthly sales data for chart
    const monthlySalesQuery = `
      SELECT 
        DATE_TRUNC('month', order_date) as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
        AND status IN ('completed', 'shipped', 'delivered')
      GROUP BY DATE_TRUNC('month', order_date)
      ORDER BY month
    `;

    // Get order status distribution
    const orderStatusQuery = `
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `;

    // Get top selling books
    const topBooksQuery = `
      SELECT 
        b.book_id,
        b.title,
        b.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue
      FROM books b
      JOIN order_items oi ON b.book_id = oi.book_id
      JOIN orders o ON oi.order_id = o.order_id
      WHERE o.status IN ('completed', 'shipped', 'delivered')
      GROUP BY b.book_id, b.title, b.price
      ORDER BY total_sold DESC
      LIMIT 10
    `;

    // Get category distribution
    const categoryStatsQuery = `
      SELECT 
        c.name,
        COUNT(bc.book_id) as book_count,
        COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM categories c
      LEFT JOIN book_categories bc ON c.category_id = bc.category_id
      LEFT JOIN order_items oi ON bc.book_id = oi.book_id
      LEFT JOIN orders o ON oi.order_id = o.order_id AND o.status IN ('completed', 'shipped', 'delivered')
      GROUP BY c.category_id, c.name
      ORDER BY book_count DESC
    `;

    // Get recent orders
    const recentOrdersQuery = `
      SELECT 
        o.order_id,
        o.total_amount,
        o.status,
        o.created_at,
        u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    // Get low stock books
    const lowStockQuery = `
      SELECT book_id, title, stock_qty, price
      FROM books
      WHERE stock_qty <= 5
      ORDER BY stock_qty ASC
      LIMIT 10
    `;

    // Execute all queries
    const [
      basicStats,
      monthlySales,
      orderStatus,
      topBooks,
      categoryStats,
      recentOrders,
      lowStock
    ] = await Promise.all([
      db.query(statsQuery),
      db.query(monthlySalesQuery),
      db.query(orderStatusQuery),
      db.query(topBooksQuery),
      db.query(categoryStatsQuery),
      db.query(recentOrdersQuery),
      db.query(lowStockQuery)
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalCustomers: parseInt(basicStats.rows[0].total_customers),
          totalBooks: parseInt(basicStats.rows[0].total_books),
          totalOrders: parseInt(basicStats.rows[0].total_orders),
          totalCategories: parseInt(basicStats.rows[0].total_categories),
          totalRevenue: parseFloat(basicStats.rows[0].total_revenue)
        },
        charts: {
          monthlySales: monthlySales.rows.map(row => ({
            month: row.month,
            orderCount: parseInt(row.order_count),
            revenue: parseFloat(row.revenue)
          })),
          orderStatus: orderStatus.rows.map(row => ({
            status: row.status,
            count: parseInt(row.count)
          })),
          categoryDistribution: categoryStats.rows.map(row => ({
            name: row.name,
            bookCount: parseInt(row.book_count),
            totalSold: parseInt(row.total_sold || 0)
          }))
        },
        tables: {
          topBooks: topBooks.rows.map(row => ({
            id: row.book_id,
            title: row.title,
            price: parseFloat(row.price),
            totalSold: parseInt(row.total_sold),
            totalRevenue: parseFloat(row.total_revenue)
          })),
          recentOrders: recentOrders.rows.map(row => ({
            id: row.order_id,
            customerName: row.customer_name,
            totalAmount: parseFloat(row.total_amount),
            status: row.status,
            createdAt: row.created_at
          })),
          lowStock: lowStock.rows.map(row => ({
            id: row.book_id,
            title: row.title,
            stockQty: row.stock_qty,
            price: parseFloat(row.price)
          }))
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /dashboard/sales-trends
// @desc    Get sales trends for specific time periods
// @access  Private (Admin only)
router.get('/sales-trends', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = 'month', limit = 12 } = req.query;

    let dateFormat, interval;
    switch (period) {
      case 'day':
        dateFormat = 'day';
        interval = `${limit} days`;
        break;
      case 'week':
        dateFormat = 'week';
        interval = `${limit} weeks`;
        break;
      case 'month':
        dateFormat = 'month';
        interval = `${limit} months`;
        break;
      case 'year':
        dateFormat = 'year';
        interval = `${limit} years`;
        break;
      default:
        dateFormat = 'month';
        interval = '12 months';
    }

    const trendsQuery = `
      SELECT 
        DATE_TRUNC('${dateFormat}', order_date) as period,
        COUNT(*) as order_count,
        COUNT(DISTINCT user_id) as unique_customers,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM orders
      WHERE order_date >= CURRENT_DATE - INTERVAL '${interval}'
        AND status IN ('completed', 'shipped', 'delivered')
      GROUP BY DATE_TRUNC('${dateFormat}', order_date)
      ORDER BY period
    `;

    const result = await db.query(trendsQuery);

    res.json({
      success: true,
      data: {
        trends: result.rows.map(row => ({
          period: row.period,
          orderCount: parseInt(row.order_count),
          uniqueCustomers: parseInt(row.unique_customers),
          revenue: parseFloat(row.revenue),
          avgOrderValue: parseFloat(row.avg_order_value)
        }))
      }
    });

  } catch (error) {
    console.error('Sales trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sales trends',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /dashboard/customer-analytics
// @desc    Get customer analytics
// @access  Private (Admin only)
router.get('/customer-analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Customer registration trends
    const registrationTrendsQuery = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as new_customers
      FROM users
      WHERE role = 'customer'
        AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    // Top customers by orders
    const topCustomersQuery = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        COUNT(o.order_id) as order_count,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        COALESCE(AVG(o.total_amount), 0) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM users u
      LEFT JOIN orders o ON u.user_id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.user_id, u.name, u.email
      HAVING COUNT(o.order_id) > 0
      ORDER BY total_spent DESC
      LIMIT 10
    `;

    // Customer activity distribution
    const activityDistributionQuery = `
      WITH customer_order_counts AS (
        SELECT 
          u.user_id,
          COUNT(o.order_id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.user_id = o.user_id
        WHERE u.role = 'customer'
        GROUP BY u.user_id
      )
      SELECT 
        CASE 
          WHEN order_count = 0 THEN 'No Orders'
          WHEN order_count = 1 THEN '1 Order'
          WHEN order_count <= 3 THEN '2-3 Orders'
          WHEN order_count <= 5 THEN '4-5 Orders'
          ELSE '6+ Orders'
        END as category,
        COUNT(*) as customer_count
      FROM customer_order_counts
      GROUP BY 
        CASE 
          WHEN order_count = 0 THEN 'No Orders'
          WHEN order_count = 1 THEN '1 Order'
          WHEN order_count <= 3 THEN '2-3 Orders'
          WHEN order_count <= 5 THEN '4-5 Orders'
          ELSE '6+ Orders'
        END
      ORDER BY customer_count DESC
    `;

    const [registrationTrends, topCustomers, activityDistribution] = await Promise.all([
      db.query(registrationTrendsQuery),
      db.query(topCustomersQuery),
      db.query(activityDistributionQuery)
    ]);

    res.json({
      success: true,
      data: {
        registrationTrends: registrationTrends.rows.map(row => ({
          month: row.month,
          newCustomers: parseInt(row.new_customers)
        })),
        topCustomers: topCustomers.rows.map(row => ({
          id: row.user_id,
          name: row.name,
          email: row.email,
          orderCount: parseInt(row.order_count),
          totalSpent: parseFloat(row.total_spent),
          avgOrderValue: parseFloat(row.avg_order_value),
          lastOrderDate: row.last_order_date
        })),
        activityDistribution: activityDistribution.rows.map(row => ({
          category: row.category,
          customerCount: parseInt(row.customer_count)
        }))
      }
    });

  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;