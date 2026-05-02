const crypto = require('crypto');

/**
 * Pushes a product to WooCommerce
 * @param {Object} store { store_url, api_key, api_secret }
 * @param {Object} product { product_name, product_desc, price, compare_at_price, sku, barcode, weight, tags, vendor_name, images }
 */
async function pushToWooCommerce(store, product) {
    const url = new URL(store.store_url);
    const endpoint = `${url.origin}/wp-json/wc/v3/products`;
    
    const auth = Buffer.from(`${store.api_key}:${store.api_secret}`).toString('base64');
    
    // Format Images
    let images = [];
    try {
        const imgArray = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
        images = imgArray.map(img => ({ src: img.url || img }));
    } catch(e) {}

    // Format Tags
    const tags = Array.isArray(product.tags) 
        ? product.tags.map(tag => ({ name: typeof tag === 'object' ? tag.name : tag }))
        : (product.tags ? [{ name: product.tags }] : []);

    const payload = {
        name: product.product_name,
        type: 'simple',
        regular_price: product.price ? product.price.toString() : '',
        description: product.product_desc,
        short_description: product.product_desc?.substring(0, 500),
        sku: product.sku || '',
        weight: product.weight ? product.weight.toString() : '',
        images: images,
        tags: tags,
        manage_stock: false,
    };

    // Format Categories
    if (product.category_id) {
        payload.categories = [{ id: parseInt(product.category_id) }];
    }

    // Format Shipping Class
    if (product.shipping_class_id) {
        payload.shipping_class = product.shipping_class_id;
    }

    if (product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price || 0)) {
        payload.regular_price = product.compare_at_price.toString();
        payload.sale_price = product.price ? product.price.toString() : '';
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WooCommerce API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
        external_id: data.id.toString(),
        external_url: data.permalink
    };
}

/**
 * Pushes a product to Shopify
 * @param {Object} store { store_url, access_token }
 * @param {Object} product { product_name, product_desc, price, compare_at_price, sku, barcode, weight, weight_unit, tags, vendor_name, images }
 */
async function pushToShopify(store, product) {
    const url = new URL(store.store_url);
    const endpoint = `${url.origin}/admin/api/2023-10/products.json`;

    // Format Images
    let images = [];
    try {
        const imgArray = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []);
        images = imgArray.map(img => ({ src: img.url || img }));
    } catch(e) {}

    const payload = {
        product: {
            title: product.product_name,
            body_html: product.product_desc,
            vendor: product.vendor_name || 'AffiliateTunnels Sync',
            tags: product.tags || '',
            images: images,
            variants: [
                {
                    price: product.price ? product.price.toString() : '',
                    compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : null,
                    sku: product.sku || '',
                    barcode: product.barcode || '',
                    weight: product.weight || null,
                    weight_unit: product.weight_unit || 'kg',
                    requires_shipping: true
                }
            ]
        }
    };

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': store.access_token
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
        external_id: data.product.id.toString(),
        external_url: `${url.origin}/admin/products/${data.product.id}`
    };
}

/**
 * Get basic metrics (Orders, Revenue)
 */
async function getStoreMetrics(store) {
    try {
        if (store.platform === 'shopify') {
            const url = new URL(store.store_url);
            const endpoint = `${url.origin}/admin/api/2023-10/orders/count.json`;
            const response = await fetch(endpoint, {
                headers: { 'X-Shopify-Access-Token': store.access_token }
            });
            if (response.ok) {
                const data = await response.json();
                return { orders_count: data.count, status: 'connected' };
            }
        } else if (store.platform === 'woocommerce') {
            const url = new URL(store.store_url);
            const endpoint = `${url.origin}/wp-json/wc/v3/reports/sales`;
            const auth = Buffer.from(`${store.api_key}:${store.api_secret}`).toString('base64');
            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Basic ${auth}` }
            });
            if (response.ok) {
                const data = await response.json();
                return { orders_count: data[0]?.total_orders || 0, status: 'connected' };
            }
        }
    } catch (err) {
        console.error(`Error fetching metrics for ${store.platform}:`, err);
    }
    
    return { orders_count: 0, status: 'error' };
}

/**
 * Fetches available shipping classes from WooCommerce
 */
async function getWooCommerceShippingClasses(storeConfig) {
    try {
        const credentials = Buffer.from(`${storeConfig.api_key}:${storeConfig.api_secret}`).toString('base64');
        const baseUrl = storeConfig.store_url.startsWith('http') ? storeConfig.store_url : `https://${storeConfig.store_url}`;

        const res = await fetch(`${baseUrl}/wp-json/wc/v3/products/shipping_classes`, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error('WooCommerce Shipping Class Error:', await res.text());
            return [];
        }

        const data = await res.json();
        return data.map(sc => ({ id: sc.id, name: sc.name }));
    } catch (error) {
        console.error('getWooCommerceShippingClasses failed:', error);
        return [];
    }
}

/**
 * Fetches available product categories from WooCommerce
 */
async function getWooCommerceCategories(storeConfig) {
    try {
        const credentials = Buffer.from(`${storeConfig.api_key}:${storeConfig.api_secret}`).toString('base64');
        const baseUrl = storeConfig.store_url.startsWith('http') ? storeConfig.store_url : `https://${storeConfig.store_url}`;

        const res = await fetch(`${baseUrl}/wp-json/wc/v3/products/categories?per_page=100`, {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            console.error('WooCommerce Categories Error:', await res.text());
            return [];
        }

        const data = await res.json();
        return data.map(c => ({ id: c.id, name: c.name }));
    } catch (error) {
        console.error('getWooCommerceCategories failed:', error);
        return [];
    }
}

module.exports = {
    pushToWooCommerce,
    pushToShopify,
    getStoreMetrics,
    getWooCommerceShippingClasses,
    getWooCommerceCategories
};
