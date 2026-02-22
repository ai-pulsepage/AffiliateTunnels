const { TIER_LIMITS } = require('../../shared/constants');
const { query } = require('../config/db');

function tierGate(feature) {
    return async (req, res, next) => {
        try {
            const tier = req.user.tier || 'free';
            const limits = TIER_LIMITS[tier];

            if (!limits) {
                return res.status(403).json({ error: 'Invalid subscription tier' });
            }

            // Check specific feature
            if (feature && limits[feature] === false) {
                return res.status(403).json({
                    error: `This feature requires an upgraded plan`,
                    feature,
                    requiredTier: getMinTierForFeature(feature),
                });
            }

            // Check numeric limits (funnels, pages, etc.)
            if (feature === 'funnels') {
                const maxFunnels = limits.funnels;
                if (maxFunnels !== -1) {
                    const result = await query(
                        'SELECT COUNT(*) as count FROM funnels WHERE user_id = $1',
                        [req.user.id]
                    );
                    if (parseInt(result.rows[0].count) >= maxFunnels) {
                        return res.status(403).json({
                            error: `You've reached the maximum of ${maxFunnels} funnels on your plan`,
                            limit: maxFunnels,
                            requiredTier: getMinTierForFeature(feature),
                        });
                    }
                }
            }

            if (feature === 'pagesPerFunnel' && req.params.funnelId) {
                const maxPages = limits.pagesPerFunnel;
                if (maxPages !== -1) {
                    const result = await query(
                        'SELECT COUNT(*) as count FROM pages WHERE funnel_id = $1',
                        [req.params.funnelId]
                    );
                    if (parseInt(result.rows[0].count) >= maxPages) {
                        return res.status(403).json({
                            error: `You've reached the maximum of ${maxPages} pages per funnel on your plan`,
                            limit: maxPages,
                            requiredTier: getMinTierForFeature(feature),
                        });
                    }
                }
            }

            next();
        } catch (err) {
            console.error('Tier gate error:', err);
            next(err);
        }
    };
}

function getMinTierForFeature(feature) {
    for (const tier of ['pro', 'agency']) {
        const limits = TIER_LIMITS[tier];
        if (limits[feature] === true || limits[feature] === -1 || limits[feature] === 'all') {
            return tier;
        }
    }
    return 'agency';
}

module.exports = { tierGate };
