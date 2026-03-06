/**
 * BlogMaker 3000 — Scheduler
 * Runs every hour, finds workers with next_run_at <= NOW() and status='active',
 * triggers blog generation for each due worker.
 */
const { query } = require('../config/db');
const { generateBlogPost } = require('./blogmaker-engine');

let schedulerInterval = null;

function startBlogScheduler() {
    if (schedulerInterval) return;
    console.log('[BlogScheduler] ⏰ Started — checking every 60 minutes');

    // Check immediately on start
    runScheduledJobs();

    // Then every 60 minutes
    schedulerInterval = setInterval(runScheduledJobs, 60 * 60 * 1000);
}

async function runScheduledJobs() {
    try {
        // Find active workers with due next_run_at
        const dueWorkers = await query(
            `SELECT w.*, m.subdomain, m.site_title
             FROM blog_workers w
             LEFT JOIN microsites m ON w.microsite_id = m.id
             WHERE w.status = 'active'
               AND w.next_run_at IS NOT NULL
               AND w.next_run_at <= NOW()`
        );

        if (dueWorkers.rows.length === 0) return;

        console.log(`[BlogScheduler] Found ${dueWorkers.rows.length} due worker(s)`);

        for (const worker of dueWorkers.rows) {
            try {
                console.log(`[BlogScheduler] Generating for worker "${worker.worker_name}" (${worker.id})`);

                // Pick next topic from the topics list, or generate random
                const topics = typeof worker.topics === 'string' ? JSON.parse(worker.topics) : (worker.topics || []);
                const unwritten = topics.filter(t => !t.generated);
                const topic = unwritten.length > 0 ? unwritten[0].title : null;

                const post = await generateBlogPost(worker, topic, worker.user_id);
                console.log(`[BlogScheduler] ✅ Generated: "${post.title}" for ${worker.worker_name}`);

                // Mark topic as generated if we used one from the list
                if (unwritten.length > 0) {
                    const updatedTopics = topics.map(t =>
                        t.title === unwritten[0].title ? { ...t, generated: true } : t
                    );
                    await query('UPDATE blog_workers SET topics = $1 WHERE id = $2', [JSON.stringify(updatedTopics), worker.id]);
                }

                // Calculate next run based on cron-like schedule
                const nextRun = calculateNextRun(worker.schedule_cron);
                await query(
                    'UPDATE blog_workers SET next_run_at = $1, updated_at = NOW() WHERE id = $2',
                    [nextRun, worker.id]
                );

            } catch (err) {
                console.error(`[BlogScheduler] ❌ Error for worker ${worker.id}:`, err.message);
            }
        }
    } catch (err) {
        console.error('[BlogScheduler] Scheduler run error:', err);
    }
}

/**
 * Simple cron-like next-run calculator
 * Supports patterns like "0 9 1,15 * *" (day 1 and 15 at 9am)
 * or interval days like every 22 days
 */
function calculateNextRun(cronExpr) {
    if (!cronExpr) return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // default: 14 days

    const parts = cronExpr.split(' ');
    if (parts.length < 5) {
        // Simple interval: assume it's just a number of days
        const days = parseInt(cronExpr) || 14;
        return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    // Parse standard cron: minute hour day-of-month month day-of-week
    const [minute, hour, dayOfMonth] = parts;
    const now = new Date();

    // Parse days (e.g., "1,15" or "*/22")
    if (dayOfMonth.includes('/')) {
        // Interval: */22 means every 22 days
        const interval = parseInt(dayOfMonth.split('/')[1]) || 14;
        return new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
    }

    if (dayOfMonth.includes(',')) {
        // Specific days: 1,15
        const days = dayOfMonth.split(',').map(Number).sort((a, b) => a - b);
        const targetHour = parseInt(hour) || 9;
        const targetMinute = parseInt(minute) || 0;

        // Find next matching day
        for (let offset = 0; offset < 62; offset++) {
            const candidate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
            if (days.includes(candidate.getUTCDate())) {
                candidate.setUTCHours(targetHour, targetMinute, 0, 0);
                if (candidate > now) return candidate;
            }
        }
    }

    // Fallback: 14 days from now
    return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
}

function stopBlogScheduler() {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('[BlogScheduler] Stopped');
    }
}

module.exports = { startBlogScheduler, stopBlogScheduler, runScheduledJobs };
