const express = require('express');
const db = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /books
// @desc    Get all books with pagination and filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      author = '',
      minPrice = 0,
      maxPrice = 99999,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build the query dynamically
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 0;

    // Search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (b.title ILIKE $${paramCount} OR b.description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    // Category filter
    if (category) {
      paramCount++;
      whereClause += ` AND EXISTS (
        SELECT 1 FROM book_categories bc 
        JOIN categories c ON bc.category_id = c.category_id 
        WHERE bc.book_id = b.book_id AND c.name ILIKE $${paramCount}
      )`;
      queryParams.push(`%${category}%`);
    }

    // Author filter
    if (author) {
      paramCount++;
      whereClause += ` AND EXISTS (
        SELECT 1 FROM book_authors ba 
        JOIN authors a ON ba.author_id = a.author_id 
        WHERE ba.book_id = b.book_id AND a.name ILIKE $${paramCount}
      )`;
      queryParams.push(`%${author}%`);
    }

    // Price range filter
    paramCount++;
    whereClause += ` AND b.price >= $${paramCount}`;
    queryParams.push(parseFloat(minPrice));

    paramCount++;
    whereClause += ` AND b.price <= $${paramCount}`;
    queryParams.push(parseFloat(maxPrice));

    // Validate sort parameters
    const validSortFields = ['title', 'price', 'created_at', 'pub_date'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const orderBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Main query with pagination
    const booksQuery = `
      SELECT DISTINCT
        b.book_id,
        b.isbn,
        b.title,
        b.price,
        b.stock_qty,
        b.pub_date,
        b.description,
        b.image_url,
        p.publisher_name,
        b.created_at,
        b.updated_at,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.review_id) as review_count
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN reviews r ON b.book_id = r.book_id
      ${whereClause}
      GROUP BY b.book_id, p.publisher_name
      ORDER BY b.${orderBy} ${order}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(parseInt(limit), offset);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT b.book_id) as total
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      ${whereClause}
    `;

    const [booksResult, countResult] = await Promise.all([
      db.query(booksQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, paramCount))
    ]);

    // Get authors and categories for each book
    const books = await Promise.all(
      booksResult.rows.map(async (book) => {
        // Get authors
        const authorsQuery = `
          SELECT a.author_id, a.name
          FROM authors a
          JOIN book_authors ba ON a.author_id = ba.author_id
          WHERE ba.book_id = $1
        `;
        const authorsResult = await db.query(authorsQuery, [book.book_id]);

        // Get categories
        const categoriesQuery = `
          SELECT c.category_id, c.name
          FROM categories c
          JOIN book_categories bc ON c.category_id = bc.category_id
          WHERE bc.book_id = $1
        `;
        const categoriesResult = await db.query(categoriesQuery, [book.book_id]);

        return {
          id: book.book_id,
          isbn: book.isbn,
          title: book.title,
          price: parseFloat(book.price),
          stockQty: book.stock_qty,
          pubDate: book.pub_date,
          description: book.description,
          imageUrl: book.image_url,
          publisher: book.publisher_name,
          authors: authorsResult.rows,
          categories: categoriesResult.rows,
          avgRating: parseFloat(book.avg_rating).toFixed(1),
          reviewCount: parseInt(book.review_count),
          createdAt: book.created_at,
          updatedAt: book.updated_at
        };
      })
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /books/:id
// @desc    Get a single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bookQuery = `
      SELECT 
        b.book_id,
        b.isbn,
        b.title,
        b.price,
        b.stock_qty,
        b.pub_date,
        b.description,
        b.image_url,
        p.publisher_name,
        b.created_at,
        b.updated_at,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.review_id) as review_count
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      LEFT JOIN reviews r ON b.book_id = r.book_id
      WHERE b.book_id = $1
      GROUP BY b.book_id, p.publisher_name
    `;

    const bookResult = await db.query(bookQuery, [id]);

    if (bookResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = bookResult.rows[0];

    // Get authors
    const authorsQuery = `
      SELECT a.author_id, a.name, a.bio
      FROM authors a
      JOIN book_authors ba ON a.author_id = ba.author_id
      WHERE ba.book_id = $1
    `;
    const authorsResult = await db.query(authorsQuery, [id]);

    // Get categories
    const categoriesQuery = `
      SELECT c.category_id, c.name, c.description
      FROM categories c
      JOIN book_categories bc ON c.category_id = bc.category_id
      WHERE bc.book_id = $1
    `;
    const categoriesResult = await db.query(categoriesQuery, [id]);

    // Get recent reviews
    const reviewsQuery = `
      SELECT r.review_id, r.rating, r.comment, r.created_at,
             u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.book_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;
    const reviewsResult = await db.query(reviewsQuery, [id]);

    res.json({
      success: true,
      data: {
        book: {
          id: book.book_id,
          isbn: book.isbn,
          title: book.title,
          price: parseFloat(book.price),
          stockQty: book.stock_qty,
          pubDate: book.pub_date,
          description: book.description,
          imageUrl: book.image_url,
          publisher: book.publisher_name,
          authors: authorsResult.rows,
          categories: categoriesResult.rows,
          avgRating: parseFloat(book.avg_rating).toFixed(1),
          reviewCount: parseInt(book.review_count),
          recentReviews: reviewsResult.rows.map(review => ({
            id: review.review_id,
            rating: review.rating,
            comment: review.comment,
            reviewerName: review.reviewer_name,
            createdAt: review.created_at
          })),
          createdAt: book.created_at,
          updatedAt: book.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /books
// @desc    Create a new book
// @access  Private (Authenticated users)
router.post('/', authenticateToken, validate(schemas.book), async (req, res) => {
  try {
    const {
      isbn,
      title,
      price,
      stock_qty,
      publisher_id,
      pub_date,
      description,
      image_url,
      author_ids = [],
      category_ids = []
    } = req.body;

    // Start a transaction
    await db.query('BEGIN');

    try {
      // Insert book
      const insertBookQuery = `
        INSERT INTO books (isbn, title, price, stock_qty, publisher_id, pub_date, description, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING book_id, created_at
      `;

      const bookResult = await db.query(insertBookQuery, [
        isbn || null,
        title,
        price,
        stock_qty || 0,
        publisher_id || null,
        pub_date || null,
        description || null,
        image_url || null
      ]);

      const bookId = bookResult.rows[0].book_id;

      // Insert book-author relationships
      if (author_ids && author_ids.length > 0) {
        for (const authorId of author_ids) {
          await db.query(
            'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
            [bookId, authorId]
          );
        }
      }

      // Insert book-category relationships
      if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await db.query(
            'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
            [bookId, categoryId]
          );
        }
      }

      await db.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: {
          bookId,
          createdAt: bookResult.rows[0].created_at
        }
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create book error:', error);
    
    if (error.constraint === 'books_isbn_key') {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /books/:id
// @desc    Update a book
// @access  Private (Authenticated users)
router.put('/:id', authenticateToken, validate(schemas.book), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isbn,
      title,
      price,
      stock_qty,
      publisher_id,
      pub_date,
      description,
      image_url,
      author_ids = [],
      category_ids = []
    } = req.body;

    // Check if book exists
    const checkBook = await db.query('SELECT book_id FROM books WHERE book_id = $1', [id]);
    if (checkBook.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Start a transaction
    await db.query('BEGIN');

    try {
      // Update book
      const updateBookQuery = `
        UPDATE books 
        SET isbn = $1, title = $2, price = $3, stock_qty = $4, 
            publisher_id = $5, pub_date = $6, description = $7, 
            image_url = $8, updated_at = CURRENT_TIMESTAMP
        WHERE book_id = $9
        RETURNING updated_at
      `;

      const updateResult = await db.query(updateBookQuery, [
        isbn || null,
        title,
        price,
        stock_qty || 0,
        publisher_id || null,
        pub_date || null,
        description || null,
        image_url || null,
        id
      ]);

      // Update book-author relationships
      await db.query('DELETE FROM book_authors WHERE book_id = $1', [id]);
      if (author_ids && author_ids.length > 0) {
        for (const authorId of author_ids) {
          await db.query(
            'INSERT INTO book_authors (book_id, author_id) VALUES ($1, $2)',
            [id, authorId]
          );
        }
      }

      // Update book-category relationships
      await db.query('DELETE FROM book_categories WHERE book_id = $1', [id]);
      if (category_ids && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await db.query(
            'INSERT INTO book_categories (book_id, category_id) VALUES ($1, $2)',
            [id, categoryId]
          );
        }
      }

      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Book updated successfully',
        data: {
          updatedAt: updateResult.rows[0].updated_at
        }
      });

    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Update book error:', error);
    
    if (error.constraint === 'books_isbn_key') {
      return res.status(409).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /books/:id
// @desc    Delete a book
// @access  Private (Authenticated users)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM books WHERE book_id = $1 RETURNING book_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;