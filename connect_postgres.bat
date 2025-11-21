@echo off
echo ============================================
echo  PostgreSQL Database Connection Script
echo  CS 665 - Online Bookstore Database
echo ============================================
echo.
echo Connecting to PostgreSQL...
echo Database: bookstore_db
echo User: postgres
echo Host: localhost
echo.
echo After connection, you can run these commands:
echo.
echo 1. List all tables:
echo    \dt
echo.
echo 2. View table structure:
echo    \d table_name
echo.
echo 3. Select data from tables:
echo    SELECT * FROM users;
echo    SELECT * FROM books;
echo    SELECT * FROM orders;
echo.
echo 4. Exit PostgreSQL:
echo    \q
echo.
echo ============================================
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d bookstore_db -h localhost

pause