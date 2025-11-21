-- Online Bookstore Database Schema (3NF)
-- Based on CS 665 Project Step 3 normalization

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS book_categories CASCADE;
DROP TABLE IF EXISTS book_authors CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS publishers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Publishers table
CREATE TABLE publishers (
  publisher_id SERIAL PRIMARY KEY,
  publisher_name VARCHAR(200) NOT NULL,
  publisher_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Categories table
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Authors table
CREATE TABLE authors (
  author_id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Books table
CREATE TABLE books (
  book_id SERIAL PRIMARY KEY,
  isbn VARCHAR(20) UNIQUE,
  title VARCHAR(255) NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  stock_qty INT DEFAULT 0,
  publisher_id INT REFERENCES publishers(publisher_id),
  pub_date DATE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for many-to-many relationship between Books and Authors
CREATE TABLE book_authors (
  book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
  author_id INT REFERENCES authors(author_id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, author_id)
);

-- Create junction table for many-to-many relationship between Books and Categories
CREATE TABLE book_categories (
  book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
  category_id INT REFERENCES categories(category_id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

-- Create Orders table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create OrderItems table
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
  book_id INT REFERENCES books(book_id),
  quantity INT NOT NULL,
  unit_price NUMERIC(8,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reviews table
CREATE TABLE reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  book_id INT REFERENCES books(book_id) ON DELETE CASCADE,
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Create indexes for better performance
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_price ON books(price);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);

-- Insert sample data

-- Insert Publishers
INSERT INTO publishers (publisher_name, publisher_address) VALUES
('Penguin Random House', '1745 Broadway, New York, NY 10019'),
('HarperCollins', '195 Broadway, New York, NY 10007'),
('Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020'),
('Macmillan', '120 Broadway, New York, NY 10271'),
('Hachette Book Group', '1290 Avenue of the Americas, New York, NY 10104');

-- Insert Categories
INSERT INTO categories (name, description) VALUES
('Fiction', 'Fictional literature including novels and short stories'),
('Non-Fiction', 'Factual books including biographies, self-help, and educational'),
('Science Fiction', 'Science fiction and speculative fiction'),
('Mystery', 'Mystery, thriller, and crime novels'),
('Romance', 'Romantic fiction and love stories'),
('Biography', 'Life stories and memoirs'),
('History', 'Historical books and accounts'),
('Technology', 'Books about technology, programming, and computers'),
('Business', 'Business, management, and entrepreneurship'),
('Health', 'Health, wellness, and medical books');

-- Insert Authors
INSERT INTO authors (name, bio) VALUES
('J.K. Rowling', 'British author best known for the Harry Potter series'),
('George Orwell', 'English novelist and essayist, author of 1984 and Animal Farm'),
('Jane Austen', 'English novelist known for Pride and Prejudice'),
('Stephen King', 'American author of horror, supernatural fiction, and suspense'),
('Agatha Christie', 'English writer known for detective novels'),
('Isaac Asimov', 'American writer and professor of biochemistry, known for science fiction'),
('Maya Angelou', 'American poet, memoirist, and civil rights activist'),
('Malcolm Gladwell', 'Canadian journalist and author of pop psychology books'),
('Steve Jobs', 'Co-founder of Apple Inc.'),
('Michelle Obama', 'Former First Lady of the United States, author');

-- Insert Users (including admin)
INSERT INTO users (name, email, password_hash, address, phone, role) VALUES
('Admin User', 'admin@bookstore.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '123 Admin St', '555-0001', 'admin'),
('John Smith', 'john.smith@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '456 Oak Ave', '555-0002', 'customer'),
('Emily Johnson', 'emily.johnson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '789 Pine St', '555-0003', 'customer'),
('Michael Brown', 'michael.brown@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '321 Elm Dr', '555-0004', 'customer'),
('Sarah Davis', 'sarah.davis@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '654 Maple Ln', '555-0005', 'customer'),
('David Wilson', 'david.wilson@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '987 Cedar Rd', '555-0006', 'customer'),
('Jessica Miller', 'jessica.miller@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '147 Birch Way', '555-0007', 'customer'),
('Robert Garcia', 'robert.garcia@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '258 Spruce St', '555-0008', 'customer'),
('Amanda Rodriguez', 'amanda.rodriguez@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '369 Willow Ave', '555-0009', 'customer'),
('Christopher Lee', 'christopher.lee@email.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '741 Ash Blvd', '555-0010', 'customer');

-- Insert Books
INSERT INTO books (isbn, title, price, stock_qty, publisher_id, pub_date, description, image_url) VALUES
('9780439139601', 'Harry Potter and the Goblet of Fire', 14.99, 50, 1, '2000-07-08', 'The fourth book in the Harry Potter series', 'https://example.com/harry-potter-4.jpg'),
('9780451524935', '1984', 13.99, 75, 2, '1949-06-08', 'Dystopian social science fiction novel', 'https://example.com/1984.jpg'),
('9780141439518', 'Pride and Prejudice', 12.99, 60, 1, '1813-01-28', 'Classic romance novel', 'https://example.com/pride-prejudice.jpg'),
('9780307277671', 'The Shining', 15.99, 40, 3, '1977-01-28', 'Horror novel by Stephen King', 'https://example.com/shining.jpg'),
('9780062073488', 'Murder on the Orient Express', 14.49, 35, 2, '1934-01-01', 'Classic mystery novel by Agatha Christie', 'https://example.com/orient-express.jpg'),
('9780553293357', 'Foundation', 16.99, 45, 4, '1951-05-01', 'Science fiction novel by Isaac Asimov', 'https://example.com/foundation.jpg'),
('9780345391803', 'I Know Why the Caged Bird Sings', 13.49, 55, 3, '1969-01-01', 'Autobiography by Maya Angelou', 'https://example.com/caged-bird.jpg'),
('9780316017930', 'Outliers', 17.99, 65, 2, '2008-11-18', 'Pop psychology book by Malcolm Gladwell', 'https://example.com/outliers.jpg'),
('9781451648539', 'Steve Jobs', 18.99, 30, 3, '2011-10-24', 'Biography of Steve Jobs', 'https://example.com/steve-jobs.jpg'),
('9781524763138', 'Becoming', 19.99, 85, 1, '2018-11-13', 'Memoir by Michelle Obama', 'https://example.com/becoming.jpg'),
('9780439358071', 'Harry Potter and the Order of the Phoenix', 15.99, 42, 1, '2003-06-21', 'The fifth book in the Harry Potter series', 'https://example.com/harry-potter-5.jpg'),
('9780062316097', 'Sapiens', 16.49, 38, 2, '2011-01-01', 'A Brief History of Humankind', 'https://example.com/sapiens.jpg');

-- Insert Book-Author relationships
INSERT INTO book_authors (book_id, author_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 1);

-- Insert Book-Category relationships
INSERT INTO book_categories (book_id, category_id) VALUES
(1, 1), (1, 3), (2, 1), (2, 3), (3, 1), (3, 5), (4, 1), (5, 4), (6, 3), (7, 6), (8, 2), (8, 9), (9, 6), (10, 6), (11, 1), (11, 3), (12, 2), (12, 7);

-- Insert Orders
INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES
(2, 29.98, 'completed', '456 Oak Ave, City, State 12345'),
(3, 45.97, 'shipped', '789 Pine St, City, State 12345'),
(4, 15.99, 'processing', '321 Elm Dr, City, State 12345'),
(5, 33.48, 'completed', '654 Maple Ln, City, State 12345'),
(6, 18.99, 'cancelled', '987 Cedar Rd, City, State 12345'),
(7, 52.96, 'completed', '147 Birch Way, City, State 12345'),
(8, 14.99, 'pending', '258 Spruce St, City, State 12345'),
(9, 31.98, 'shipped', '369 Willow Ave, City, State 12345'),
(10, 19.99, 'completed', '741 Ash Blvd, City, State 12345'),
(2, 16.49, 'processing', '456 Oak Ave, City, State 12345');

-- Insert Order Items
INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
(1, 1, 2, 14.99), (2, 2, 1, 13.99), (2, 3, 1, 12.99), (2, 4, 1, 15.99),
(3, 4, 1, 15.99), (4, 7, 1, 13.49), (4, 8, 1, 17.99), (5, 9, 1, 18.99),
(6, 1, 1, 14.99), (6, 5, 1, 14.49), (6, 6, 1, 16.99), (6, 10, 1, 19.99),
(7, 1, 1, 14.99), (8, 3, 1, 12.99), (8, 10, 1, 19.99), (9, 10, 1, 19.99),
(10, 12, 1, 16.49);

-- Insert Reviews
INSERT INTO reviews (user_id, book_id, rating, comment) VALUES
(2, 1, 5, 'Excellent book! Highly recommended.'),
(3, 2, 4, 'Very thought-provoking and well written.'),
(4, 3, 5, 'A timeless classic that everyone should read.'),
(5, 4, 3, 'Good horror story but quite intense.'),
(6, 5, 4, 'Classic mystery with great plot twists.'),
(7, 6, 5, 'Amazing science fiction series starter.'),
(8, 7, 5, 'Powerful and inspiring autobiography.'),
(9, 8, 4, 'Interesting insights about success.'),
(10, 9, 4, 'Great biography of an innovative leader.'),
(2, 10, 5, 'Inspiring and beautifully written memoir.');

-- Display table creation success
SELECT 'Database schema created successfully!' as message;