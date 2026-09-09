require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const reseed = async () => {
  const client = await pool.connect();

  try {
    const dataPath = path.join(__dirname, '../../data/quotes.json');

    if (!fs.existsSync(dataPath)) {
      console.error(`Error: ${dataPath} not found.`);
      console.log('Run "npm run db:export" first to create the quotes file.');
      process.exit(1);
    }

    const quotes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Found ${quotes.length} quotes in quotes.json`);

    // Confirm before clearing
    if (process.argv[2] !== '--force') {
      console.log('\nThis will DELETE all existing quotes and reload from quotes.json.');
      console.log('Run with --force to skip this warning.\n');
      const readline = require('readline');
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

      const answer = await new Promise(resolve => {
        rl.question('Continue? (y/N): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log('Aborted.');
        process.exit(0);
      }
    }

    console.log('Clearing existing quotes...');
    await client.query('TRUNCATE quotes RESTART IDENTITY');

    console.log('Inserting quotes...');
    for (const item of quotes) {
      await client.query(
        `INSERT INTO quotes (source_name, quote_text, speaker_1, speaker_2, speaker_3, notes, contributor, tags, next_up, used_at, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          item.source || item.source_name,
          item.quote || item.quote_text,
          item.speaker_1 || item.speaker || null,
          item.speaker_2 || null,
          item.speaker_3 || null,
          item.notes || null,
          item.contributor || null,
          Array.isArray(item.tags) ? item.tags : [],
          Boolean(item.next_up),
          item.used ? new Date() : (item.used_at ? new Date(item.used_at) : null),
          item.image_url || item.image || null
        ]
      );
    }

    const count = await client.query('SELECT COUNT(*) FROM quotes');
    console.log(`\nReseed complete! ${count.rows[0].count} quotes in database.`);
  } catch (err) {
    console.error('Error reseeding database:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

reseed();
