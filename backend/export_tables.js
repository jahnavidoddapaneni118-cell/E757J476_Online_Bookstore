const { pool } = require('./config/database');
const fs = require('fs');

async function exportTablesAsHTML() {
  try {
    console.log('📄 Generating HTML table exports for screenshots...\n');

    const tables = ['users', 'books', 'categories', 'authors', 'publishers', 'orders', 'order_items', 'reviews'];
    
    for (const tableName of tables) {
      const result = await pool.query(`SELECT * FROM ${tableName} LIMIT 20`);
      
      let html = `
<!DOCTYPE html>
<html>
<head>
    <title>${tableName.toUpperCase()} Table</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #e3f2fd; }
        .meta { color: #666; font-size: 0.9em; margin-top: 10px; }
    </style>
</head>
<body>
    <h1>📋 ${tableName.toUpperCase()} TABLE</h1>
    <div class="meta">CS 665 Database Project - ${result.rows.length} records shown</div>
    <table>
        <thead>
            <tr>
`;

      if (result.rows.length > 0) {
        Object.keys(result.rows[0]).forEach(key => {
          html += `                <th>${key}</th>\n`;
        });
        
        html += `            </tr>
        </thead>
        <tbody>
`;

        result.rows.forEach(row => {
          html += `            <tr>\n`;
          Object.values(row).forEach(value => {
            html += `                <td>${value || 'NULL'}</td>\n`;
          });
          html += `            </tr>\n`;
        });
      }

      html += `        </tbody>
    </table>
    <div class="meta">Generated: ${new Date().toLocaleString()}</div>
</body>
</html>`;

      fs.writeFileSync(`./exports/${tableName}_table.html`, html);
      console.log(`✅ Exported: ${tableName}_table.html`);
    }

    console.log('\n🎉 HTML exports complete! Open the files in your browser to take screenshots.');
    console.log('📁 Files location: backend/exports/');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
  } finally {
    process.exit();
  }
}

// Create exports directory
if (!fs.existsSync('./exports')) {
  fs.mkdirSync('./exports');
}

exportTablesAsHTML();