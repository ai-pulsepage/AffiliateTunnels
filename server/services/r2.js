const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSettingSync } = require('../config/settings');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

function getR2Client() {
    const accessKey = getSettingSync('r2_access_key');
    const secretKey = getSettingSync('r2_secret_key');
    const endpoint = getSettingSync('r2_endpoint');

    if (!accessKey || !secretKey || !endpoint) {
        return null;
    }

    return new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
    });
}

async function uploadFile(buffer, originalName, mimetype, folder = 'media') {
    const client = getR2Client();
    if (!client) {
        throw new Error('R2 storage not configured. Please add R2 credentials in Admin Settings.');
    }

    const bucket = getSettingSync('r2_bucket_name');
    const publicUrl = getSettingSync('r2_public_url');
    const ext = path.extname(originalName);
    const key = `${folder}/${uuidv4()}${ext}`;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
    }));

    return {
        key,
        url: `${publicUrl}/${key}`,
        size: buffer.length,
        mimetype,
    };
}

async function deleteFile(key) {
    const client = getR2Client();
    if (!client) return;

    const bucket = getSettingSync('r2_bucket_name');
    await client.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    }));
}

async function uploadPublishedPage(html, funnelSlug, pageSlug) {
    const client = getR2Client();
    if (!client) {
        throw new Error('R2 storage not configured. Please add R2 credentials in Admin Settings.');
    }

    const bucket = getSettingSync('r2_bucket_name');
    const publicUrl = getSettingSync('r2_public_url');
    const key = `pages/${funnelSlug}/${pageSlug || 'index'}.html`;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(html, 'utf-8'),
        ContentType: 'text/html; charset=utf-8',
        CacheControl: 'public, max-age=300', // 5 min cache
    }));

    return {
        key,
        url: `${publicUrl}/${key}`,
    };
}

async function uploadBlogPost(html, slug) {
    const client = getR2Client();
    if (!client) {
        throw new Error('R2 storage not configured. Please add R2 credentials in Admin Settings.');
    }

    const bucket = getSettingSync('r2_bucket_name');
    const publicUrl = getSettingSync('r2_public_url');
    const key = `blog/${slug}/index.html`;

    await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(html, 'utf-8'),
        ContentType: 'text/html; charset=utf-8',
        CacheControl: 'public, max-age=300',
    }));

    return {
        key,
        url: `${publicUrl}/${key}`,
    };
}

module.exports = { uploadFile, deleteFile, uploadPublishedPage, uploadBlogPost };
