const { pool } = require('./config/database');

async function addMorePublishers() {
  try {
    console.log('📚 Adding more publishers to meet 10+ row requirement...\n');

    const publishers = [
      { name: 'Scholastic Press', address: '557 Broadway, New York, NY 10012' },
      { name: 'HarperCollins Publishers', address: '195 Broadway, New York, NY 10007' },
      { name: 'Simon & Schuster', address: '1230 Avenue of the Americas, New York, NY 10020' },
      { name: 'Macmillan Publishers', address: '120 Broadway, New York, NY 10271' },
      { name: 'Houghton Mifflin Harcourt', address: '3 Park Ave, New York, NY 10016' },
      { name: 'Tor Books', address: '120 Broadway, New York, NY 10271' }
    ];

    for (const publisher of publishers) {
      const insertQuery = `
        INSERT INTO publishers (publisher_name, publisher_address, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING
      `;
      
      await pool.query(insertQuery, [publisher.name, publisher.address]);
      console.log(`✅ Added publisher: ${publisher.name}`);
    }

    // Check final count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM publishers');
    console.log(`\n📊 Total publishers now: ${countResult.rows[0].count}`);
    
    console.log('\n🎉 Publishers table now has sufficient data!');
    
  } catch (error) {
    console.error('❌ Error adding publishers:', error.message);
  } finally {
    process.exit();
  }
}

addMorePublishers();