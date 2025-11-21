const express = require('express');
const db = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT 
        c.category_id,
        c.name,
        c.description,
        c.created_at,
        COUNT(bc.book_id) as book_count
      FROM categories c
      LEFT JOIN book_categories bc ON c.category_id = bc.category_id
      GROUP BY c.category_id, c.name, c.description, c.created_at
      ORDER BY c.name ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) as total FROM categories';

    const [result, countResult] = await Promise.all([
      db.query(query, [parseInt(limit), offset]),
      db.query(countQuery)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        categories: result.rows.map(category => ({
          id: category.category_id,
          name: category.name,
          description: category.description,
          bookCount: parseInt(category.book_count),
          createdAt: category.created_at
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /categories/:id
// @desc    Get a single category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const categoryQuery = `
      SELECT 
        c.category_id,
        c.name,
        c.description,
        c.created_at,
        COUNT(bc.book_id) as book_count
      FROM categories c
      LEFT JOIN book_categories bc ON c.category_id = bc.category_id
      WHERE c.category_id = $1
      GROUP BY c.category_id, c.name, c.description, c.created_at
    `;

    const result = await db.query(categoryQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const category = result.rows[0];

    // Get some books in this category
    const booksQuery = `
      SELECT b.book_id, b.title, b.price, b.image_url
      FROM books b
      JOIN book_categories bc ON b.book_id = bc.book_id
      WHERE bc.category_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    const booksResult = await db.query(booksQuery, [id]);

    res.json({
      success: true,
      data: {
        category: {
          id: category.category_id,
          name: category.name,
          description: category.description,
          bookCount: parseInt(category.book_count),
          createdAt: category.created_at,
          recentBooks: booksResult.rows.map(book => ({
            id: book.book_id,
            title: book.title,
            price: parseFloat(book.price),
            imageUrl: book.image_url
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /categories
// @desc    Create a new category
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, validate(schemas.category), async (req, res) => {
  try {
    const { name, description } = req.body;

    const insertQuery = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING category_id, name, description, created_at
    `;

    const result = await db.query(insertQuery, [name, description || null]);
    const category = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: {
          id: category.category_id,
          name: category.name,
          description: category.description,
          createdAt: category.created_at
        }
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.constraint === 'categories_name_key') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /categories/:id
// @desc    Update a category
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, validate(schemas.category), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updateQuery = `
      UPDATE categories 
      SET name = $1, description = $2
      WHERE category_id = $3
      RETURNING category_id, name, description, created_at
    `;

    const result = await db.query(updateQuery, [name, description || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const category = result.rows[0];

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        category: {
          id: category.category_id,
          name: category.name,
          description: category.description,
          createdAt: category.created_at
        }
      }
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.constraint === 'categories_name_key') {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /categories/:id
// @desc    Delete a category
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has associated books
    const checkBooks = await db.query(
      'SELECT COUNT(*) as count FROM book_categories WHERE category_id = $1',
      [id]
    );

    if (parseInt(checkBooks.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category that has associated books'
      });
    }

    const result = await db.query(
      'DELETE FROM categories WHERE category_id = $1 RETURNING category_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;