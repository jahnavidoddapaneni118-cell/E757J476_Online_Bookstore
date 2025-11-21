CS 665 Project 1: A CRUD Application (Individual Project) General Description In this project, you will develop a desktop/web/mobile application that uses relational databases. Non-relational databases, such as NoSQL or XML databases are NOT allowed as they do not reflect the database relations we’ve covered in this class. This is an individual project. It is recommended that you choose from popular database software such as 1) SQL Server Express, 2) MySQL, 3) SQLite, 4) PostgreSQL, etc. This project has five (5) parts. That is, there will be five (5) submission threads on Blackboard. Please submit each part by its own deadline. Total points: 2 + 4 + 4 + 6 + 4 = 20 points. General Step-by-Step Guidelines == Step 1 == choose a business/story as your mock business, design tentative database tables (at least 5 tables), then select a tech stack to implement the information management tool for the business. Submit a proposal document (in .pdf format to include some figures) at the end of this step. == Step 2 == based on the tentative database tables, perform functional dependency analysis on all tables. Please identify all non-trivial functional dependencies, any partial dependencies and/or transitive dependencies. Submit a doc (in .md format) to include the result of FD analysis. == Step 3 == based on the FD analysis, submit a document to list all tables you need to use for your project. It is required that all tables are in the 3rd normal form. Include an analysis to state that 1) tables are in 1NF, 2) tables are in 2NF, and 3) tables are in 3NF. Submit a doc (in .md format) to include all tables and the analysis. == Step 4 == choose a database software (local or online) to create tables and insert data. Note that 1) please have at least 5 tables, and 2) each table should have at least 10 rows (for test account). Take a screenshot for each table. Then, develop a web application using the tech stack proposed in Step 1 to use the database. The web app should have the following functionalities: 1) user authentication, 2) basic CRUD functionalities, 3) data visualization on the web app. Note that version control (git and GitHub) is required for the app development. At the end of this step, submit a document (.pdf format) that contains 1) screenshots of data in each table and 2) screenshots of your app showing major functionalities. == Step 5 == create a public GitHub repo for this project and have at least 10 commits. Each commit should make non-trivial contributions, such as 1) adding views to your app and 2) implementing database services. Each commit needs to have a meaningful and descriptive message. At the end of this step, submit a document (.pdf format) that contains 1) a screenshot of list of your commits, 3) screenshots of three major commits and 3) a link to your repo. DO NOT PUT SENSITIVE INFORMATION IN A PUBLIC REPO. Due Dates Step 1 submission: 11/06/25 Thursday Step 2 submission: 11/11/25 Tuesday Step 3 submission: 11/13/25 Thursday Step 4 submission: 11/20/25 Thursday Step 5 submission: 11/21/25 Friday Final Note Project management: evenly distribute your workload and development progress throughout the project. “The ‘last few days' Effort” is not recommended (e.g., all commits made only in the last one or two days of the project due date).

Step 1: Proposed Solution:
CS 665 — Project 1: Step 1 Proposal

Project Title: Online Bookstore Management System
Submission Date: November 6, 2025
1. Business / Story (General Description)
The Online Bookstore Management System helps manage users, books, authors, categories,
orders, and reviews. It supports CRUD operations, user authentication, order tracking, and
data visualization. This relational schema allows demonstration of normalization and
database integrity concepts covered in CS 665.
2. Why This Business?
The bookstore scenario naturally demonstrates multiple relationships: one-to-many
(Users–Orders) and many-to-many (Books–Authors, Books–Categories). It provides a
balanced mix of complexity and clarity for database design and normalization exercises.
3. Tentative Database Tables (At least 5)
Table Name Primary/Foreign Keys Description
Users user_id (PK)
name
email (unique)
password_hash
address
phone

Stores registered users
(customers/admins) who
can browse and purchase
books.

Authors author_id (PK)
name
bio

Stores author details linked
to books via BookAuthors
table.

Categories category_id (PK)

name
description

Stores genres or categories
of books, linked via
BookCategories.

Books book_id (PK)
title
isbn (unique)
price
stock_qty
publisher
pub_date

Contains information about
books available for
purchase.

BookAuthors book_id (FK)
author_id (FK)
Composite PK (book_id,
author_id)

Defines many-to-many
relationship between Books
and Authors.

BookCategories book_id (FK)
category_id (FK)
Composite PK (book_id,
category_id)

Defines many-to-many
relationship between Books
and Categories.

Orders order_id (PK) Stores each customer order

user_id (FK)
order_date
total_amount
status
shipping_address

with total price and
shipping details.

OrderItems order_item_id (PK)
order_id (FK)
book_id (FK)
quantity
unit_price

Stores each item within an
order including quantity
and unit price.

Reviews (optional) review_id (PK)
user_id (FK)
book_id (FK)
rating
comment
created_at

Stores user reviews and
ratings for purchased
books.

4. Key Relationships
• Users (1) — (N) Orders
• Orders (1) — (N) OrderItems
• Books (N) — (N) Authors via BookAuthors
• Books (N) — (N) Categories via BookCategories
• OrderItems (N) — (1) Books
5. Tentative ER Diagram
The following figure represents the tentative ER diagram for the Online Bookstore
Management System.

6. Appendix — Sample SQL Snippets
CREATE TABLE users (
user_id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(150) UNIQUE,
password_hash TEXT,
address TEXT
);
CREATE TABLE books (
book_id SERIAL PRIMARY KEY,
title VARCHAR(255),
isbn VARCHAR(20) UNIQUE,
price NUMERIC(8,2),
stock_qty INT
);

Step 2: Proposed solution:
# CS 665 — Project 1: Step 2 — Functional Dependency Analysis

**Project:** Online Bookstore Management System  
**Submission:** Step 2 — Functional Dependencies (.md)

---

## Introduction
This document presents the functional dependency (FD) analysis for the proposed Online Bookstore Management System database schema. It identifies all non-trivial, partial, and transitive dependencies to ensure proper normalization in subsequent steps.

---

## Table of Contents
- [Users](#table-users)
- [Authors](#table-authors)
- [Categories](#table-categories)
- [Books](#table-books)
- [BookAuthors](#table-bookauthors)
- [BookCategories](#table-bookcategories)
- [Orders](#table-orders)
- [OrderItems](#table-orderitems)
- [Reviews](#table-reviews)
- [Summary / Conclusion](#summary--conclusion)

---

## Table: Users
**Attributes:** user_id, name, email, password_hash, address, phone  
**Primary Key:** user_id

### Functional Dependencies
1. `user_id → name, email, password_hash, address, phone`  
   - Non-trivial: **Yes**  
   - Partial dependency: **No**  
   - Transitive dependency: **No**  
   - Reason: Each user_id uniquely identifies a user record.

2. `email → user_id, name, password_hash, address, phone`  
   - Non-trivial: **Yes** (email is unique)  
   - Partial dependency: **No**  
   - Transitive dependency: **No**  

---

## Table: Authors
**Attributes:** author_id, name, bio  
**Primary Key:** author_id

### Functional Dependencies
1. `author_id → name, bio`  
   - Non-trivial: **Yes**  
   - Partial dependency: **No**  
   - Transitive dependency: **No**  

---

## Table: Categories
**Attributes:** category_id, name, description  
**Primary Key:** category_id

### Functional Dependencies
1. `category_id → name, description`  
   - Non-trivial: **Yes**  
   - Partial dependency: **No**  
   - Transitive dependency: **No**  

2. `name → category_id, description` *(if category names are unique)*  
   - Non-trivial: **Yes** (if uniqueness rule applies)  

---

## Table: Books
**Attributes:** book_id, title, isbn, price, stock_qty, publisher, pub_date  
**Primary Key:** book_id

### Functional Dependencies
1. `book_id → title, isbn, price, stock_qty, publisher, pub_date`  
   - Non-trivial: **Yes**  
   - Partial dependency: **No**  
   - Transitive dependency: **No**  

2. `isbn → book_id, title, price, stock_qty, publisher, pub_date`  
   - Non-trivial: **Yes** (ISBN is unique)  

3. `book_id → publisher_id` and `publisher_id → publisher_name, publisher_address`  
   - Transitive dependency example: `book_id → publisher_name` (through publisher_id)

---

## Table: BookAuthors
**Attributes:** book_id, author_id  
**Primary Key:** (book_id, author_id)

### Functional Dependencies
1. `(book_id, author_id) → (no other attributes)`  
   - Non-trivial: **No additional FDs**  
   - Partial dependency: **No**  
   - Transitive dependency: **No**  

> Note: If additional attributes (e.g., contribution_percentage) were added, partial dependencies should be checked.

---

## Table: BookCategories
**Attributes:** book_id, category_id  
**Primary Key:** (book_id, category_id)

### Functional Dependencies
1. `(book_id, category_id) → (no other attributes)`  
   - Non-trivial: **No**  
   - Partial dependency: **No**  

---

## Table: Orders
**Attributes:** order_id, user_id, order_date, total_amount, status, shipping_address  
**Primary Key:** order_id

### Functional Dependencies
1. `order_id → user_id, order_date, total_amount, status, shipping_address`  
   - Non-trivial: **Yes**  
   - Partial dependency: **No**  
   - Transitive dependency: **Possible** if `user_id → user_default_shipping` and copied into `shipping_address`.

---

## Table: OrderItems
**Attributes:** order_item_id, order_id, book_id, quantity, unit_price  
**Primary Key:** order_item_id (or composite key: (order_id, book_id))

### Functional Dependencies
1. `order_item_id → order_id, book_id, quantity, unit_price`  
   - Non-trivial: **Yes**  

2. `(order_id, book_id) → quantity, unit_price` *(if composite key used)*  
   - Non-trivial: **Yes**  
   - Partial dependency: **Check if book_id or order_id alone determines price.**  
   - Reason: unit_price may differ per order (snapshot at order time).

---

## Table: Reviews (optional)
**Attributes:** review_id, user_id, book_id, rating, comment, created_at  
**Primary Key:** review_id

### Functional Dependencies
1. `review_id → user_id, book_id, rating, comment, created_at`  
   - Non-trivial: **Yes**  

2. `(user_id, book_id) → review_id, rating, comment` *(if one review per user per book)*  
   - Non-trivial: **Yes** (depends on business rule)  

---

## Summary / Conclusion

### Non-trivial Dependencies:
- Present in all tables based on primary keys and unique identifiers (e.g., ISBN, email).

### Partial Dependencies:
- Only possible in composite-key tables if extra attributes are added (none in current schema).

### Transitive Dependencies:
- Example: `book_id → publisher_id` and `publisher_id → publisher_name` → `book_id → publisher_name`.

### Overall Result:
The schema currently shows only minimal partial or transitive dependencies. The next step (Step 3) will normalize all relations to **Third Normal Form (3NF)** based on this FD analysis.

---
Step 3: Proposed solution
# CS 665 — Project 1: Step 3 — 3NF Normalization

**Project:** Online Bookstore Management System  
**Submission:** Step 3 — 3NF Schema (.md)  

---

## Introduction
This document provides the complete normalization of the Online Bookstore Management System database schema into **Third Normal Form (3NF)**.  
The normalization steps are based on the **functional dependencies (FDs)** identified in Step 2.  
For each relation, we verify **1NF**, **2NF**, and **3NF**, perform decompositions when required, and present the final 3NF schema.

---

# Functional Dependencies Used (From Step 2)

## Users
- user_id → name, email, password_hash, address, phone  
- email → user_id, name, password_hash, address, phone

## Authors
- author_id → name, bio

## Categories
- category_id → name, description  
- name → category_id, description (if unique)

## Books
- book_id → isbn, title, price, stock_qty, publisher_id, pub_date  
- isbn → book_id, title, price, stock_qty, publisher_id, pub_date  
- publisher_id → publisher_name, publisher_address

## BookAuthors
- (book_id, author_id) → none

## BookCategories
- (book_id, category_id) → none

## Orders
- order_id → user_id, order_date, total_amount, status, shipping_address

## OrderItems
- order_item_id → order_id, book_id, quantity, unit_price  
- (order_id, book_id) → quantity, unit_price (if composite key used)

## Reviews
- review_id → user_id, book_id, rating, comment, created_at  
- (user_id, book_id) → review_id, rating, comment (business rule: one review per user per book)

---

# Normalization Process

Below is the detailed process of verifying **1NF → 2NF → 3NF** for each relation.

---

# FINAL 3NF RELATIONS

All relations listed below satisfy **1NF, 2NF, and 3NF** based on the FDs.

---

# 1. USERS

**Attributes:** user_id (PK), name, email, password_hash, address, phone  
**Primary Key:** user_id  
**Alternate Key:** email (unique)  

### 1NF
- All values are atomic.  
- No repeating groups.

### 2NF
- PK is a single attribute → no partial dependency.

### 3NF
- No non-key attribute depends on another non-key attribute.  
✔ Fully in 3NF.

---

# 2. AUTHORS

**Attributes:** author_id (PK), name, bio  

### 1NF
Atomic attributes.

### 2NF
Single-attribute PK → satisfied.

### 3NF
No transitive dependencies.  
✔ Fully in 3NF.

---

# 3. CATEGORIES

**Attributes:** category_id (PK), name (UNIQUE), description  

### 1NF
Atomic attributes.

### 2NF
Single attribute PK → satisfied.

### 3NF
If `name` is unique, it becomes a candidate key → valid.  
✔ Fully in 3NF.

---

# 4. PUBLISHERS (created to remove transitive dependency)

**Attributes:** publisher_id (PK), publisher_name, publisher_address  

### Why created?
FD: book_id → publisher_id → publisher_name  
This is a **transitive dependency**.  
Decomposition removes it.

### Normal Forms
✔ 1NF, ✔ 2NF, ✔ 3NF

---

# 5. BOOKS

**Attributes:** book_id (PK), isbn (UNIQUE), title, price, stock_qty, publisher_id (FK), pub_date  

### 1NF
Atomic attributes.

### 2NF
Single attribute PK → satisfied.

### 3NF
No transitive dependency remains.  
✔ Fully in 3NF.

---

# 6. BOOKAUTHORS

**Attributes:** book_id (FK), author_id (FK)  
**Primary Key:** (book_id, author_id)

### 1NF
Atomic.

### 2NF
No non-key attributes → no partial dependency possible.

### 3NF
No transitive dependency.  
✔ Fully in 3NF.

---

# 7. BOOKCATEGORIES

**Attributes:** book_id (FK), category_id (FK)  
**Primary Key:** (book_id, category_id)

### 1NF/2NF/3NF
Same reasoning as BookAuthors.  
✔ Fully in 3NF.

---

# 8. ORDERS

**Attributes:** order_id (PK), user_id (FK), order_date, total_amount, status, shipping_address  

### 1NF
Atomic values.

### 2NF
Single PK → no partials.

### 3NF
Snapshot shipping_address is allowed.  
✔ Fully in 3NF.

---

# 9. ORDERITEMS

**Attributes:** order_item_id (PK), order_id (FK), book_id (FK), quantity, unit_price  

### 1NF
Atomic.

### 2NF
Single PK → no partial dependency.

### 3NF
unit_price is a snapshot; not a transitive dependency.  
✔ Fully in 3NF.

---

# 10. REVIEWS

**Attributes:** review_id (PK), user_id (FK), book_id (FK), rating, comment, created_at  

### 1NF
Atomic attributes.

### 2NF
Single PK → no partial dependencies.

### 3NF
Alternate unique key `(user_id, book_id)` is valid.  
✔ Fully in 3NF.

---

# FINAL 3NF SCHEMA (SUMMARY)

```
Users(user_id PK, name, email UNIQUE, password_hash, address, phone)

Authors(author_id PK, name, bio)

Categories(category_id PK, name UNIQUE, description)

Publishers(publisher_id PK, publisher_name, publisher_address)

Books(book_id PK, isbn UNIQUE, title, price, stock_qty, publisher_id FK, pub_date)

BookAuthors(book_id FK, author_id FK, PRIMARY KEY(book_id, author_id))

BookCategories(book_id FK, category_id FK, PRIMARY KEY(book_id, category_id))

Orders(order_id PK, user_id FK, order_date, total_amount, status, shipping_address)

OrderItems(order_item_id PK, order_id FK, book_id FK, quantity, unit_price)

Reviews(review_id PK, user_id FK, book_id FK, rating, comment, created_at, UNIQUE(user_id, book_id))
```

---

# SQL DDL — 3NF CREATE TABLE STATEMENTS

```sql
CREATE TABLE Publishers (
  publisher_id SERIAL PRIMARY KEY,
  publisher_name VARCHAR(200),
  publisher_address TEXT
);

CREATE TABLE Books (
  book_id SERIAL PRIMARY KEY,
  isbn VARCHAR(20) UNIQUE,
  title VARCHAR(255),
  price NUMERIC(8,2),
  stock_qty INT,
  publisher_id INT REFERENCES Publishers(publisher_id),
  pub_date DATE
);

CREATE TABLE Authors (
  author_id SERIAL PRIMARY KEY,
  name VARCHAR(200),
  bio TEXT
);

CREATE TABLE BookAuthors (
  book_id INT REFERENCES Books(book_id),
  author_id INT REFERENCES Authors(author_id),
  PRIMARY KEY (book_id, author_id)
);

CREATE TABLE Categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE,
  description TEXT
);

CREATE TABLE BookCategories (
  book_id INT REFERENCES Books(book_id),
  category_id INT REFERENCES Categories(category_id),
  PRIMARY KEY (book_id, category_id)
);

CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150) UNIQUE,
  password_hash TEXT,
  address TEXT,
  phone VARCHAR(20)
);

CREATE TABLE Orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES Users(user_id),
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount NUMERIC(10,2),
  status VARCHAR(50),
  shipping_address TEXT
);

CREATE TABLE OrderItems (
  order_item_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES Orders(order_id),
  book_id INT REFERENCES Books(book_id),
  quantity INT,
  unit_price NUMERIC(8,2)
);

CREATE TABLE Reviews (
  review_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES Users(user_id),
  book_id INT REFERENCES Books(book_id),
  rating SMALLINT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, book_id)
);
```

---

# Conclusion
All relations have been verified and normalized to **1NF, 2NF, and 3NF**.  
The resulting schema is consistent, minimal, dependency-preserving, and ready for implementation in Step 4.

---