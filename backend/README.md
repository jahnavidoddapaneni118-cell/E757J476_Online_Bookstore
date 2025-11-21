# Online Bookstore Backend API

This is the backend API for the Online Bookstore Management System, built with Node.js, Express, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **CRUD Operations**: Complete CRUD functionality for books, categories, authors, and orders
- **Dashboard Analytics**: Comprehensive statistics and visualizations for admin users
- **Database Integration**: PostgreSQL with normalized 3NF schema
- **Security**: Rate limiting, CORS, input validation, and security headers
- **Error Handling**: Comprehensive error handling and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **Password Hashing**: bcryptjs

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your database credentials:
   ```
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bookstore_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Setup PostgreSQL Database**
   
   Create a new database:
   ```sql
   CREATE DATABASE bookstore_db;
   ```
   
   Run the schema file to create tables and insert sample data:
   ```bash
   psql -U your_username -d bookstore_db -f database/schema.sql
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Books
- `GET /api/books` - Get all books with pagination and filtering
- `GET /api/books/:id` - Get a single book by ID
- `POST /api/books` - Create a new book (admin only)
- `PUT /api/books/:id` - Update a book (admin only)
- `DELETE /api/books/:id` - Delete a book (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get a single category by ID
- `POST /api/categories` - Create a new category (admin only)
- `PUT /api/categories/:id` - Update a category (admin only)
- `DELETE /api/categories/:id` - Delete a category (admin only)

### Orders
- `GET /api/orders` - Get orders (admin: all, customer: own)
- `GET /api/orders/:id` - Get a single order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `DELETE /api/orders/:id` - Cancel an order

### Dashboard (Admin only)
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/sales-trends` - Get sales trends
- `GET /api/dashboard/customer-analytics` - Get customer analytics

## Sample API Usage

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "address": "123 Main St",
    "phone": "555-1234"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get books (with filtering)
```bash
curl "http://localhost:5000/api/books?page=1&limit=10&search=harry&category=fiction&minPrice=10&maxPrice=50"
```

### Create an order (requires authentication)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "items": [
      {"book_id": 1, "quantity": 2},
      {"book_id": 3, "quantity": 1}
    ],
    "shipping_address": "123 Main St, City, State 12345"
  }'
```

## Default Admin Account

The database schema includes a default admin account:
- **Email**: admin@bookstore.com
- **Password**: password (hashed in database)
- **Role**: admin

You can use this account to access admin-only endpoints and the admin dashboard.

## Database Schema

The database follows a normalized 3NF design with the following main tables:
- `users` - User accounts with authentication
- `books` - Book catalog
- `authors` - Author information
- `categories` - Book categories
- `publishers` - Publisher information
- `orders` - Customer orders
- `order_items` - Order line items
- `reviews` - Book reviews and ratings
- `book_authors` - Many-to-many: books and authors
- `book_categories` - Many-to-many: books and categories

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Auth Rate Limiting**: 5 authentication attempts per 15 minutes per IP
- **CORS**: Configured for frontend URL
- **Helmet**: Security headers
- **Input Validation**: Joi schema validation
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds

## Development

### Running with nodemon
```bash
npm run dev
```

### Database Reset
To reset the database with fresh sample data:
```bash
psql -U your_username -d bookstore_db -f database/schema.sql
```

### Environment Variables
Make sure to set all required environment variables in your `.env` file. Never commit sensitive information to version control.

## API Documentation

Visit `http://localhost:5000/api/docs` when the server is running to see the complete API documentation.

## Health Check

Visit `http://localhost:5000/health` to check if the server is running properly.

## Troubleshooting

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Authentication Issues**
   - Check JWT_SECRET is set in `.env`
   - Verify token is included in Authorization header as "Bearer TOKEN"

3. **Rate Limiting**
   - Wait 15 minutes if you hit rate limits
   - Reduce request frequency during development

4. **Port Conflicts**
   - Change PORT in `.env` if 5000 is already in use