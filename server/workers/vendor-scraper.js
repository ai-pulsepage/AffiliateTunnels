const { query } = require('../config/db');
const { scrapeProductData } = require('../services/scraper');
const { refineProductCopy } = require('../services/ai-writer');

async function processVendorScrapeQueue() {
    console.log('[Vendor Worker] Checking for pending scrapes...');
    
    // Grab up to 5 pending items to process in this tick
    const result = await query(`
        SELECT id, source_url 
        FROM vendor_products 
        WHERE status = 'pending_scrape' 
        LIMIT 5
    `);

    if (result.rows.length === 0) return;

    for (const item of result.rows) {
        try {
            // Mark as scraping so another worker doesn't grab it
            await query(`UPDATE vendor_products SET status = 'scraping' WHERE id = $1`, [item.id]);
            console.log(`[Vendor Worker] Processing ID ${item.id}: ${item.source_url}`);

            // 1. Scrape raw data
            const rawData = await scrapeProductData(item.source_url);

            // 2. Run AI Refinement
            const refined = await refineProductCopy(rawData.title, rawData.rawText);

            // 3. Save and mark ready
            await query(`
                UPDATE vendor_products SET 
                    original_title = $1,
                    original_desc = $2,
                    original_images = $3,
                    original_price = $4,
                    refined_title = $5,
                    refined_desc = $6,
                    tags = $7,
                    status = 'pending_review',
                    updated_at = NOW()
                WHERE id = $8
            `, [
                rawData.title, 
                rawData.rawText, 
                JSON.stringify(rawData.images), 
                rawData.price,
                refined.title, 
                refined.description,
                JSON.stringify(refined.tags || []),
                item.id
            ]);

            console.log(`[Vendor Worker] Successfully processed ID ${item.id}`);

        } catch (err) {
            console.error(`[Vendor Worker] Error processing ID ${item.id}:`, err);
            await query(`
                UPDATE vendor_products SET 
                    status = 'failed',
                    error_message = $1,
                    updated_at = NOW()
                WHERE id = $2
            `, [err.message, item.id]);
        }
    }
}

module.exports = {
    processVendorScrapeQueue
};
