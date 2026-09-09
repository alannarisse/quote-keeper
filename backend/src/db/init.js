require('dotenv').config();
const pool = require('./pool');

const initDb = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        source_name VARCHAR(255) NOT NULL,
        quote_text TEXT NOT NULL,
        speaker_1 VARCHAR(255),
        speaker_2 VARCHAR(255),
        speaker_3 VARCHAR(255),
        notes TEXT,
        contributor VARCHAR(255),
        tags TEXT[] DEFAULT '{}',
        image_url TEXT,
        next_up BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      CREATE INDEX IF NOT EXISTS idx_quotes_source ON quotes(source_name);
      CREATE INDEX IF NOT EXISTS idx_quotes_used ON quotes(used_at);
      CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON quotes(deleted_at);
      CREATE INDEX IF NOT EXISTS idx_quotes_tags ON quotes USING GIN(tags);
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

initDb();
