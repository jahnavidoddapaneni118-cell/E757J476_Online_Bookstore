const { pool } = require('./config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database Structure and Data...\n');

    // Check tables and their row counts
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
        AND table_name NOT LIKE 'pg_%'
      ) t
      ORDER BY table_name;
    `;

    const tablesResult = await pool.query(tablesQuery);
    
    console.log('📊 DATABASE TABLES AND ROW COUNTS:');
    console.log('=====================================');
    
    let totalTables = 0;
    let tablesWithEnoughData = 0;
    
    for (const table of tablesResult.rows) {
      totalTables++;
      const hasEnoughData = table.row_count >= 10;
      if (hasEnoughData) tablesWithEnoughData++;
      
      console.log(`${hasEnoughData ? '✅' : '❌'} ${table.table_name.padEnd(20)} | ${table.row_count} rows`);
    }
    
    console.log('\n📈 SUMMARY:');
    console.log('=============');
    console.log(`Total Tables: ${totalTables}`);
    console.log(`Tables with 10+ rows: ${tablesWithEnoughData}`);
    console.log(`Requirement (5+ tables): ${totalTables >= 5 ? '✅ MET' : '❌ NOT MET'}`);
    console.log(`Requirement (10+ rows): ${tablesWithEnoughData >= 5 ? '✅ MET' : '❌ NEEDS MORE DATA'}`);

    // Detailed table structures
    console.log('\n🏗️  TABLE STRUCTURES:');
    console.log('=====================');
    
    for (const table of tablesResult.rows) {
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(columnsQuery, [table.table_name]);
      
      console.log(`\n📋 ${table.table_name.toUpperCase()} (${table.row_count} rows):`);
      columnsResult.rows.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // Sample data from key tables
    console.log('\n📝 SAMPLE DATA:');
    console.log('===============');
    
    const sampleTables = ['users', 'books', 'categories', 'orders'];
    
    for (const tableName of sampleTables) {
      try {
        const sampleQuery = `SELECT * FROM ${tableName} LIMIT 3`;
        const sampleResult = await pool.query(sampleQuery);
        
        console.log(`\n🔸 ${tableName.toUpperCase()} (showing 3 of ${tablesResult.rows.find(t => t.table_name === tableName)?.row_count || 0} rows):`);
        
        if (sampleResult.rows.length > 0) {
          const keys = Object.keys(sampleResult.rows[0]);
          sampleResult.rows.forEach((row, index) => {
            console.log(`   Row ${index + 1}:`);
            keys.slice(0, 4).forEach(key => { // Show first 4 columns to avoid clutter
              console.log(`     ${key}: ${row[key]}`);
            });
          });
        }
      } catch (error) {
        console.log(`   ❌ Error accessing ${tableName}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    process.exit();
  }
}

checkDatabase();