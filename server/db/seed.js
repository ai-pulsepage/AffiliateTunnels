const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
    const client = await pool.connect();

    try {
        // Seed admin users
        const admins = [
            { email: 'thedevingrey@gmail.com', name: 'Dev Admin', role: 'admin', tier: 'agency' },
            { email: 'gabrielsebastian74@gmail.com', name: 'Gabriel', role: 'admin', tier: 'agency' },
        ];

        const defaultPassword = await bcrypt.hash('AdminPass123!', 12);

        for (const admin of admins) {
            const exists = await client.query('SELECT id FROM users WHERE email = $1', [admin.email]);
            if (exists.rows.length === 0) {
                await client.query(
                    `INSERT INTO users (email, password_hash, name, role, tier) VALUES ($1, $2, $3, $4, $5)`,
                    [admin.email, defaultPassword, admin.name, admin.role, admin.tier]
                );
                console.log(`✓ Created admin: ${admin.email}`);
            } else {
                // Ensure existing users are admin + agency
                await client.query(
                    `UPDATE users SET role = 'admin', tier = 'agency' WHERE email = $1`,
                    [admin.email]
                );
                console.log(`✓ Admin exists: ${admin.email} (ensured admin+agency)`);
            }
        }

        console.log('\nSeed completed. Default password: AdminPass123!');
        console.log('IMPORTANT: Change your password after first login!\n');
    } finally {
        client.release();
    }
}

if (require.main === module) {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
    seed()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seed failed:', err);
            process.exit(1);
        });
}

module.exports = { seed };
