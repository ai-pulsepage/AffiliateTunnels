const { query } = require('./db');
const { decrypt } = require('../services/crypto');

// In-memory cache of settings, refreshed periodically
let settingsCache = {};
let lastRefresh = 0;
const CACHE_TTL = 60000; // 1 minute

async function loadSettings() {
    try {
        const result = await query('SELECT key, value, is_encrypted FROM settings');
        const settings = {};
        for (const row of result.rows) {
            settings[row.key] = row.is_encrypted ? decrypt(row.value) : row.value;
        }
        settingsCache = settings;
        lastRefresh = Date.now();
        return settings;
    } catch (err) {
        console.error('Failed to load settings:', err.message);
        return settingsCache; // return stale cache
    }
}

async function getSetting(key) {
    if (Date.now() - lastRefresh > CACHE_TTL) {
        await loadSettings();
    }
    return settingsCache[key] || null;
}

async function getAllSettings() {
    if (Date.now() - lastRefresh > CACHE_TTL) {
        await loadSettings();
    }
    return { ...settingsCache };
}

function getSettingSync(key) {
    return settingsCache[key] || null;
}

module.exports = { loadSettings, getSetting, getAllSettings, getSettingSync };
