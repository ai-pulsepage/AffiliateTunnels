/**
 * Single entry point for Railway deployment.
 * Runs migrations → seed → starts server, all in one process.
 */
console.log('[BOOT] AffiliateTunnels starting...');
console.log('[BOOT] NODE_ENV:', process.env.NODE_ENV);
console.log('[BOOT] PORT:', process.env.PORT);
console.log('[BOOT] DATABASE_URL:', process.env.DATABASE_URL ? '***set***' : 'MISSING');

const { migrate } = require('./server/db/migrate');
const { seed } = require('./server/db/seed');

async function boot() {
    try {
        console.log('[BOOT] Running migrations...');
        await migrate();
        console.log('[BOOT] Migrations complete.');

        console.log('[BOOT] Running seed...');
        await seed();
        console.log('[BOOT] Seed complete.');

        console.log('[BOOT] Starting server...');
        require('./server/index');
    } catch (err) {
        console.error('[BOOT] Fatal error during startup:', err);
        process.exit(1);
    }
}

boot();
