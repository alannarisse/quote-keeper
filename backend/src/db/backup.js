require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./pool');

const backupDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('Generating database backup...');

    const result = await client.query(`
      SELECT source_name, quote_text, speaker_1, speaker_2, speaker_3,
             notes, contributor, tags, image_url, next_up,
             used_at IS NOT NULL as used, created_at, updated_at, deleted_at
      FROM quotes
      ORDER BY source_name, id
    `);

    const backupData = {
      timestamp: new Date().toISOString(),
      total_quotes: result.rows.length,
      active_quotes: result.rows.filter(r => !r.deleted_at).length,
      deleted_quotes: result.rows.filter(r => !!r.deleted_at).length,
      quotes: result.rows.map(row => ({
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
        used: Boolean(row.used),
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at || null
      }))
    };

    // Determine backup locations (both local repository backups/ and volume backups/ if available)
    const backupDirs = [path.join(__dirname, '../../backups')];

    const uploadsDir = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : null;
    if (uploadsDir) {
      backupDirs.push(path.join(uploadsDir, 'backups'));
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = `quotes-backup-${timestampStr}.json`;

    for (const dir of backupDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      // Also write latest.json
      const latestPath = path.join(dir, 'latest-backup.json');
      fs.writeFileSync(latestPath, JSON.stringify(backupData, null, 2));

      console.log(`Saved backup to: ${filePath}`);

      // Keep only the most recent 30 backup files in this directory
      const files = fs.readdirSync(dir)
        .filter(f => f.startsWith('quotes-backup-') && f.endsWith('.json'))
        .sort();

      if (files.length > 30) {
        const toDelete = files.slice(0, files.length - 30);
        toDelete.forEach(f => {
          try {
            fs.unlinkSync(path.join(dir, f));
            console.log(`Cleaned up old backup: ${f}`);
          } catch (e) {
            console.warn(`Could not delete old backup ${f}:`, e.message);
          }
        });
      }
    }

    console.log(`Backup completed successfully! (${backupData.quotes.length} total quotes backed up)`);
    return backupData;
  } catch (err) {
    console.error('Error during database backup:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
};

if (require.main === module) {
  backupDatabase();
}

module.exports = backupDatabase;
