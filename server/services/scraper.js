const cheerio = require('cheerio');

/**
 * Scrapes basic product information from a given URL.
 * Designed to handle generic e-commerce sites and extract raw text for the AI.
 */
async function scrapeProductData(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Extract Title
        let title = $('meta[property="og:title"]').attr('content') || 
                    $('title').text() || 
                    $('h1').first().text();

        // 2. Extract Price (Try common selectors)
        let price = $('meta[property="product:price:amount"]').attr('content') ||
                    $('meta[property="og:price:amount"]').attr('content') ||
                    $('.price').first().text() ||
                    $('[data-price]').first().attr('data-price') ||
                    '';

        price = price.replace(/[^0-9.]/g, ''); // Clean price

        // 3. Extract Images
        let images = [];
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage) images.push(ogImage);

        // Try to find a main product image gallery or prominent images
        $('img').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && (src.includes('product') || src.includes('item') || $(el).width() > 300)) {
                // Ensure absolute URL
                try {
                    const absUrl = new URL(src, url).href;
                    if (!images.includes(absUrl)) images.push(absUrl);
                } catch (e) {}
            }
        });

        // 4. Extract Raw Description / Body Text
        // We look for common description containers, or just grab the body text
        let rawDesc = '';
        const descSelectors = ['.product-description', '#description', '.description', '[itemprop="description"]'];
        
        for (const selector of descSelectors) {
            if ($(selector).length > 0) {
                rawDesc = $(selector).text();
                break;
            }
        }

        // Fallback: Just grab a large chunk of text from the main container
        if (!rawDesc || rawDesc.length < 50) {
            $('script, style, nav, footer, header').remove();
            rawDesc = $('body').text().replace(/\s+/g, ' ').trim();
            // Just take the first 5000 characters to pass to AI to avoid context limits
            rawDesc = rawDesc.substring(0, 5000);
        }

        return {
            title: title.trim(),
            price: price ? parseFloat(price) : null,
            images: images.slice(0, 10), // Take up to 10 images
            rawText: rawDesc
        };

    } catch (error) {
        console.error('Scraping Error:', error);
        throw new Error(`Failed to scrape product: ${error.message}`);
    }
}

module.exports = {
    scrapeProductData
};
