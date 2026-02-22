const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
    const client = await pool.connect();

    try {
        // Create migrations tracking table
        await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

        // Get already executed migrations
        const executed = await client.query('SELECT filename FROM _migrations ORDER BY filename');
        const executedSet = new Set(executed.rows.map(r => r.filename));

        // Read migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        let migrated = 0;

        for (const file of files) {
            if (executedSet.has(file)) {
                continue;
            }

            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
                await client.query('COMMIT');
                migrated++;
                console.log(`  ✓ ${file}`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`  ✗ ${file}: ${err.message}`);
                throw err;
            }
        }

        if (migrated === 0) {
            console.log('No new migrations to run.');
        } else {
            console.log(`\n${migrated} migration(s) executed successfully.`);
        }
    } finally {
        client.release();
    }
}

// Run if called directly
if (require.main === module) {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
    migrate()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { migrate };
