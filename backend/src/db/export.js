require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const exportQuotes = async () => {
  const client = await pool.connect();

  try {
    console.log('Exporting quotes from database...');

    const result = await client.query(`
      SELECT source_name, quote_text, speaker_1, speaker_2, speaker_3,
             notes, contributor, tags, image_url, next_up, used_at IS NOT NULL as used
      FROM quotes
      WHERE deleted_at IS NULL
      ORDER BY source_name, id
    `);

    const quotes = result.rows.map(row => ({
      source: row.source_name,
      quote: row.quote_text,
      speaker_1: row.speaker_1 || null,
      speaker_2: row.speaker_2 || null,
      speaker_3: row.speaker_3 || null,
      contributor: row.contributor || null,
      tags: row.tags || [],
      notes: row.notes || null,
      image_url: row.image_url || null,
      next_up: Boolean(row.next_up),
      used: Boolean(row.used)
    }));

    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'quotes.json');
    fs.writeFileSync(outputPath, JSON.stringify(quotes, null, 2));

    console.log(`Exported ${quotes.length} quotes to: ${outputPath}`);
  } catch (err) {
    console.error('Error exporting quotes:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

exportQuotes();
