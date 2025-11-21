const express = require('express');
const { pool } = require('./config/database');
const path = require('path');

const app = express();
const PORT = 3001;

// Set up view engine for HTML rendering
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static('public'));

// Home route - list all tables
app.get('/', async (req, res) => {
  try {
    const tablesQuery = `
      SELECT 
        table_name,
        (xpath('/row/count/text()', xml_count))[1]::text::int as row_count
      FROM (
        SELECT 
          table_name,
          query_to_xml(format('select count(*) as count from %I', table_name), false, true, '') as xml_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      ) t;
    `;
    
    const result = await pool.query(tablesQuery);
    res.render('index', { tables: result.rows });
  } catch (error) {
    res.status(500).send('Database error: ' + error.message);
  }
});

// View specific table data
app.get('/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get table structure
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `;
    
    // Get table data
    const dataQuery = `SELECT * FROM ${tableName} ORDER BY 1 LIMIT 50`;
    
    const [columnsResult, dataResult] = await Promise.all([
      pool.query(columnsQuery, [tableName]),
      pool.query(dataQuery)
    ]);
    
    res.render('table', {
      tableName,
      columns: columnsResult.rows,
      data: dataResult.rows
    });
  } catch (error) {
    res.status(500).send('Database error: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`🗃️  Database Viewer running at http://localhost:${PORT}`);
  console.log('📸 Open in browser to take screenshots of your tables!');
});