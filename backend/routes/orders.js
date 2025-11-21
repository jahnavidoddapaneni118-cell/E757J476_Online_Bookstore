const express = require('express');
const db = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireAdmin, requireOwnerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /orders
// @desc    Get orders (all for admin, own for customers)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = '',
      userId = null
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 0;

    // If user is not admin, only show their orders
    if (req.user.role !== 'admin') {
      paramCount++;
      whereClause += ` AND o.user_id = $${paramCount}`;
      queryParams.push(req.user.user_id);
    } else if (userId) {
      // Admin can filter by specific user
      paramCount++;
      whereClause += ` AND o.user_id = $${paramCount}`;
      queryParams.push(parseInt(userId));
    }

    // Status filter
    if (status) {
      paramCount++;
      whereClause += ` AND o.status = $${paramCount}`;
      queryParams.push(status);
    }

    const ordersQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.order_date,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id, u.name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    const countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as total
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ${whereClause}
    `;

    const [ordersResult, countResult] = await Promise.all([
      db.query(ordersQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, paramCount))
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsQuery = `
          SELECT 
            oi.order_item_id,
            oi.quantity,
            oi.unit_price,
            b.book_id,
            b.title,
            b.image_url
          FROM order_items oi
          JOIN books b ON oi.book_id = b.book_id
          WHERE oi.order_id = $1
        `;
        const itemsResult = await db.query(itemsQuery, [order.order_id]);

        return {
          id: order.order_id,
          userId: order.user_id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          orderDate: order.order_date,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          shippingAddress: order.shipping_address,
          itemCount: parseInt(order.item_count),
          items: itemsResult.rows.map(item => ({
            id: item.order_item_id,
            bookId: item.book_id,
            title: item.title,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            imageUrl: item.image_url
          })),
          createdAt: order.created_at
        };
      })
    );

    res.json({
      success: true,
      data: {
        orders: ordersWithItems,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /orders/:id
// @desc    Get a single order
// @access  Private (Own order or Admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const orderQuery = `
      SELECT 
        o.order_id,
        o.user_id,
        o.order_date,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.created_at,
        o.updated_at,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1
    `;

    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Check if user can access this order
    if (req.user.role !== 'admin' && req.user.user_id !== order.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.quantity,
        oi.unit_price,
        oi.created_at,
        b.book_id,
        b.title,
        b.isbn,
        b.image_url,
        b.description
      FROM order_items oi
      JOIN books b ON oi.book_id = b.book_id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at
    `;
    const itemsResult = await db.query(itemsQuery, [id]);

    res.json({
      success: true,
      data: {
        order: {
          id: order.order_id,
          userId: order.user_id,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          orderDate: order.order_date,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          shippingAddress: order.shipping_address,
          items: itemsResult.rows.map(item => ({
            id: item.order_item_id,
            bookId: item.book_id,
            title: item.title,
            isbn: item.isbn,
            description: item.description,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            subtotal: item.quantity * parseFloat(item.unit_price),
            imageUrl: item.image_url,
            createdAt: item.created_at
          })),
          createdAt: order.created_at,
          updatedAt: order.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /orders
// @desc    Create a new order
// @access  Private
router.post('/', authenticateToken, validate(schemas.order), async (req, res) => {
  try {
    const { items, shipping_address } = req.body;
    const userId = req.user.user_id;

    // Start transaction
    await db.query('BEGIN');

    try {
      let totalAmount = 0;

      // Validate items and calculate total
      for (const item of items) {
        const bookQuery = 'SELECT price, stock_qty FROM books WHERE book_id = $1';
        const bookResult = await db.query(bookQuery, [item.book_id]);

        if (bookResult.rows.length === 0) {
          throw new Error(`Book with ID ${item.book_id} not found`);
        }

        const book = bookResult.rows[0];

        if (book.stock_qty < item.quantity) {
          throw new Error(`Insufficient stock for book ID ${item.book_id}`);
        }

        totalAmount += parseFloat(book.price) * item.quantity;
      }

      // Create order
      const orderQuery = `
        INSERT INTO orders (user_id, total_amount, status, shipping_address)
        VALUES ($1, $2, $3, $4)
        RETURNING order_id, created_at
      `;

      const orderResult = await db.query(orderQuery, [
        userId,
        totalAmount,
        'pending',
        shipping_address
      ]);

      const orderId = orderResult.rows[0].order_id;

      // Create order items and update stock
      for (const item of items) {
        const bookQuery = 'SELECT price FROM books WHERE book_id = $1';
        const bookResult = await db.query(bookQuery, [item.book_id]);
        const unitPrice = parseFloat(bookResult.rows[0].price);

        // Insert order item
        await db.query(
          'INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
          [orderId, item.book_id, item.quantity, unitPrice]
        );

        // Update book stock
        await db.query(
          'UPDATE books SET stock_qty = stock_qty - $1 WHERE book_id = $2',
          [item.quantity, item.book_id]
        );
      }

      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: {
          orderId,
          totalAmount,
          createdAt: orderResult.rows[0].created_at
        }
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }

    const updateQuery = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE order_id = $2
      RETURNING order_id, status, updated_at
    `;

    const result = await db.query(updateQuery, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: result.rows[0].order_id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /orders/:id
// @desc    Cancel an order (only if pending)
// @access  Private (Own order or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderQuery = 'SELECT user_id, status FROM orders WHERE order_id = $1';
    const orderResult = await db.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Check permissions
    if (req.user.role !== 'admin' && req.user.user_id !== order.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order with status: ' + order.status
      });
    }

    // Start transaction
    await db.query('BEGIN');

    try {
      // Get order items to restore stock
      const itemsQuery = 'SELECT book_id, quantity FROM order_items WHERE order_id = $1';
      const itemsResult = await db.query(itemsQuery, [id]);

      // Restore stock for each item
      for (const item of itemsResult.rows) {
        await db.query(
          'UPDATE books SET stock_qty = stock_qty + $1 WHERE book_id = $2',
          [item.quantity, item.book_id]
        );
      }

      // Update order status to cancelled
      await db.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE order_id = $2',
        ['cancelled', id]
      );

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Order cancelled successfully'
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;