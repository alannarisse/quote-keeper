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
      ORDER BY source_name, id
    `);

    const quotes = result.rows.map(row => {
      const quote = {
        source: row.source_name,
        quote: row.quote_text
      };
      if (row.speaker_1) quote.speaker = row.speaker_1;
      if (row.speaker_2) quote.speaker_2 = row.speaker_2;
      if (row.speaker_3) quote.speaker_3 = row.speaker_3;
      if (row.notes) quote.notes = row.notes;
      if (row.contributor && row.contributor !== 'Initial Seed') quote.contributor = row.contributor;
      if (row.tags && row.tags.length > 0) quote.tags = row.tags;
      if (row.image_url) quote.image_url = row.image_url;
      if (row.next_up) quote.next_up = true;
      if (row.used) quote.used = true;
      return quote;
    });

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
