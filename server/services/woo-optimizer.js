const { query } = require('../config/db');
const { getSetting } = require('../config/settings');
const { 
    getWooCommerceProducts, 
    getOrCreateWooCommerceCategory, 
    updateWooCommerceProduct 
} = require('./store-sync');

const GEMINI_MODEL = 'gemini-2.5-flash';

// A in-memory queue to process optimization jobs sequentially in the background
const jobQueue = [];
let isProcessing = false;

/**
 * Queue a job for background execution
 */
function queueOptimizationJob(jobId) {
    jobQueue.push(jobId);
    triggerQueueProcessor();
}

/**
 * Checks queue and processes next job
 */
async function triggerQueueProcessor() {
    if (isProcessing || jobQueue.length === 0) return;
    
    isProcessing = true;
    const jobId = jobQueue.shift();
    
    try {
        await processJob(jobId);
    } catch (err) {
        console.error(`Error running job ${jobId}:`, err);
    } finally {
        isProcessing = false;
        // Schedule next job
        setTimeout(triggerQueueProcessor, 1000);
    }
}

/**
 * Processes a single WooCommerce optimization job
 */
async function processJob(jobId) {
    console.log(`[Woo-Optimizer] Starting job ${jobId}`);
    
    // 1. Get Job & Store info
    const jobRes = await query('SELECT * FROM woocommerce_optimization_jobs WHERE id = $1', [jobId]);
    if (jobRes.rows.length === 0) return;
    const job = jobRes.rows[0];
    
    const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1', [job.store_id]);
    if (storeRes.rows.length === 0) {
        await updateJobStatus(jobId, 'failed', 'Store connection not found.');
        return;
    }
    const store = storeRes.rows[0];
    
    await updateJobStatus(jobId, 'running');

    try {
        // Get Gemini key
        const apiKey = process.env.GEMINI_API_KEY || await getSetting('gemini_api_key');
        if (!apiKey) {
            throw new Error('Gemini API key is not configured in settings.');
        }

        // 2. Fetch all products from WooCommerce
        // Loop pages to download products (WooCommerce API limit per page is 100)
        let page = 1;
        let allProducts = [];
        let hasMore = true;
        
        while (hasMore && allProducts.length < 500) { // Limit to 500 products per job for safety
            const products = await getWooCommerceProducts(store, page, 100);
            if (products.length === 0) {
                hasMore = false;
            } else {
                allProducts = allProducts.concat(products);
                page++;
                if (products.length < 100) hasMore = false;
            }
        }

        if (allProducts.length === 0) {
            await updateJobStatus(jobId, 'completed', null, 0, 0);
            return;
        }

        // Update total products in DB
        await query('UPDATE woocommerce_optimization_jobs SET total_products = $1 WHERE id = $2', [allProducts.length, jobId]);

        // Get WooCommerce active categories to pass to AI for context
        const categoriesRes = await fetch(`${store.store_url.startsWith('http') ? store.store_url : `https://${store.store_url}`}/wp-json/wc/v3/products/categories?per_page=100`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(`${store.api_key}:${store.api_secret}`).toString('base64')}`
            }
        });
        
        let activeCategories = [];
        if (categoriesRes.ok) {
            try {
                const cats = await categoriesRes.json();
                activeCategories = cats.map(c => c.name);
            } catch(e) {}
        }
        const activeCategoriesList = activeCategories.join(', ') || 'None';

        // 3. Process each product
        let processedCount = 0;
        
        for (const product of allProducts) {
            try {
                // Call Gemini to optimize title/description & classify categories
                const optimizedCopy = await optimizeProductWithAI(product, activeCategoriesList, apiKey);
                
                // If AI suggested new categories, map or create them in WooCommerce
                let wooCategoryIds = [];
                if (optimizedCopy.category) {
                    const mainCatId = await getOrCreateWooCommerceCategory(store, optimizedCopy.category, 0);
                    wooCategoryIds.push({ id: mainCatId });
                    
                    if (optimizedCopy.subcategory) {
                        const subCatId = await getOrCreateWooCommerceCategory(store, optimizedCopy.subcategory, mainCatId);
                        wooCategoryIds.push({ id: subCatId });
                    }
                }

                // If categories are empty, fallback to original
                if (wooCategoryIds.length === 0 && product.categories) {
                    wooCategoryIds = product.categories.map(c => ({ id: c.id }));
                }

                // Update product in WooCommerce
                const wooPayload = {
                    name: optimizedCopy.optimizedTitle,
                    description: optimizedCopy.optimizedDescription,
                    categories: wooCategoryIds
                };
                
                await updateWooCommerceProduct(store, product.id, wooPayload);

                // Save change log to DB
                const originalCategories = (product.categories || []).map(c => ({ id: c.id, name: c.name }));
                const optimizedCategoriesMap = wooCategoryIds.map(wc => {
                    const found = (product.categories || []).find(c => c.id === wc.id);
                    return { id: wc.id, name: found ? found.name : 'Auto-Created Category' };
                });

                await query(
                    `INSERT INTO woocommerce_product_changes 
                        (job_id, product_id, original_title, optimized_title, original_description, optimized_description, original_categories, optimized_categories, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                     [
                        jobId, product.id.toString(), 
                        product.name, optimizedCopy.optimizedTitle, 
                        product.description, optimizedCopy.optimizedDescription,
                        JSON.stringify(originalCategories), JSON.stringify(optimizedCategoriesMap),
                        'applied'
                     ]
                );

            } catch (err) {
                console.error(`[Woo-Optimizer] Failed to optimize product ${product.id}:`, err.message);
                // Log failure to change log table so the user knows
                await query(
                    `INSERT INTO woocommerce_product_changes 
                        (job_id, product_id, original_title, optimized_title, original_description, optimized_description, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                     [jobId, product.id.toString(), product.name, 'Optimization Failed', product.description, err.message, 'failed']
                );
            }

            processedCount++;
            // Update progress in DB
            await query('UPDATE woocommerce_optimization_jobs SET processed_products = $1 WHERE id = $2', [processedCount, jobId]);
        }

        await updateJobStatus(jobId, 'completed');
        console.log(`[Woo-Optimizer] Completed job ${jobId}`);

    } catch (err) {
        console.error(`[Woo-Optimizer] Job ${jobId} failed:`, err.message);
        await updateJobStatus(jobId, 'failed', err.message);
    }
}

/**
 * Call Gemini API to rewrite copy and categorize
 */
async function optimizeProductWithAI(product, activeCategoriesList, apiKey) {
    const prompt = `You are an expert copywriter and product merchandiser specializing in perfumes, colognes, and luxury fragrances.
Optimize the following e-commerce product details for higher conversion rates and premium positioning.

CURRENT PRODUCT COPY:
Title: ${product.name}
Description: ${product.description || 'No description provided'}

ACTIVE STORE CATEGORIES:
${activeCategoriesList}

Your task is to:
1. Optimize the Title: Make it sound premium, appealing, and clean. Keep it descriptive but elegant.
2. Optimize the Description: Rewrite it into a compelling sales description formatted in clean HTML (using <p>, <ul>, <li>, etc.). Paint a vivid picture of the fragrance notes (top, heart, base notes), the wearing experience, and why it is a must-have. Make sure it sounds luxurious.
3. Classify Category and Subcategory: From the product info, determine what Category and Subcategory this belongs to. Recommend names like:
   Category: "Fragrances" or "Colognes & Perfumes" or "Gift Sets".
   Subcategory: "Men's Fragrances", "Women's Fragrances", "Unisex", etc.
   If one of the ACTIVE STORE CATEGORIES matches your suggestion, use that exact name.

Return the result as a JSON object with this exact structure:
{
  "optimizedTitle": "New Title Here",
  "optimizedDescription": "<p>Elegant rewritten description...</p><ul><li>Top Notes: ...</li></ul>",
  "category": "Main Category Name",
  "subcategory": "Subcategory Name"
}

Return ONLY valid JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini AI Optimization request failed: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    text = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    const parsed = JSON.parse(text);
    if (!parsed.optimizedTitle || !parsed.optimizedDescription) {
        throw new Error('AI response is missing title or description fields.');
    }
    return parsed;
}

/**
 * Updates status of a job in DB
 */
async function updateJobStatus(jobId, status, errorMsg = null) {
    if (errorMsg) {
        await query(
            'UPDATE woocommerce_optimization_jobs SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3',
            [status, errorMsg, jobId]
        );
    } else {
        await query(
            'UPDATE woocommerce_optimization_jobs SET status = $1, updated_at = NOW() WHERE id = $2',
            [status, jobId]
        );
    }
}

/**
 * Reverts a single product optimization back to its original copy in WooCommerce
 */
async function revertProductChange(changeId) {
    // Get change log details
    const changeRes = await query(
        `SELECT pc.*, j.store_id 
         FROM woocommerce_product_changes pc
         JOIN woocommerce_optimization_jobs j ON pc.job_id = j.id
         WHERE pc.id = $1`,
        [changeId]
    );

    if (changeRes.rows.length === 0) throw new Error('Change log record not found.');
    const change = changeRes.rows[0];

    if (change.status === 'reverted') throw new Error('Change has already been reverted.');

    const storeRes = await query('SELECT * FROM connected_stores WHERE id = $1', [change.store_id]);
    if (storeRes.rows.length === 0) throw new Error('Store connection not found.');
    const store = storeRes.rows[0];

    // Build categories payload
    let originalCategoriesIds = [];
    try {
        const cats = change.original_categories || [];
        originalCategoriesIds = cats.map(c => ({ id: c.id }));
    } catch(e) {}

    // Revert product on WooCommerce
    const wooPayload = {
        name: change.original_title,
        description: change.original_description,
        categories: originalCategoriesIds
    };

    await updateWooCommerceProduct(store, change.product_id, wooPayload);

    // Update status in DB
    await query('UPDATE woocommerce_product_changes SET status = $1 WHERE id = $2', ['reverted', changeId]);
    return true;
}

module.exports = {
    queueOptimizationJob,
    revertProductChange
};
