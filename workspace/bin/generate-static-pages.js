#!/usr/bin/env node

/**
 * Static HTML Page Generator for SEO
 *
 * This script generates static HTML pages for each blog post
 * to improve SEO by providing crawlable content to search engines.
 *
 * Usage: node workspace/bin/generate-static-pages.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { getAssetVersions } = require('./update-asset-versions.js');

// Configuration
const METADATA_PATH = './posts-metadata.json';
const WORKSPACE_METADATA_PATH = './workspace/contents/posts-metadata.json';
const CONTENTS_DIR = './workspace/contents';
const TEMPLATE_PATH = './workspace/page-template.html';
const OUTPUT_DIR = './articles/';  // articles 디렉토리에 생성
const SITEMAP_PATH = './sitemap.xml';
const BASE_URL = 'https://keneslab.github.io';

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Load metadata (try root first, then workspace)
function loadMetadata() {
    let metadataPath = METADATA_PATH;

    // If root doesn't exist, try workspace
    if (!fs.existsSync(METADATA_PATH) && fs.existsSync(WORKSPACE_METADATA_PATH)) {
        metadataPath = WORKSPACE_METADATA_PATH;
        console.log('📋 Loading metadata from workspace...');
    }

    // If no metadata file exists, return empty array
    if (!fs.existsSync(metadataPath)) {
        console.log('⚠️  No metadata file found. Will create new one.');
        return [];
    }

    try {
        const data = fs.readFileSync(metadataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading metadata:', error);
        return [];
    }
}

// Parse HTML content to extract metadata
function parseHtmlContent(htmlContent, filename) {
    const metadata = {
        filename: filename,
        route: filename.replace('.html', ''),
        author: 'KenesLab'
    };

    // Extract title from <h1>
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
        metadata.title = h1Match[1].trim();
    }

    // Extract date from post-meta
    const dateMatch = htmlContent.match(/<span class="date">(.*?)<\/span>/i);
    if (dateMatch) {
        const dateText = dateMatch[1].trim();
        // Convert Korean date format to YYYY-MM-DD
        const koreanDateMatch = dateText.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
        if (koreanDateMatch) {
            const [, year, month, day] = koreanDateMatch;
            metadata.date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
            metadata.date = new Date().toISOString().split('T')[0];
        }
    }

    // Extract author from post-meta
    const authorMatch = htmlContent.match(/<span class="author">(.*?)<\/span>/i);
    if (authorMatch) {
        metadata.author = authorMatch[1].trim();
    }

    // Extract description from first <p> tag
    const pMatch = htmlContent.match(/<p>(.*?)<\/p>/i);
    if (pMatch) {
        let description = pMatch[1].replace(/<[^>]+>/g, '').trim();
        if (description.length > 160) {
            description = description.substring(0, 157) + '...';
        }
        metadata.description = description;
    }

    metadata.dateModified = new Date().toISOString().split('T')[0];

    return metadata;
}

// Scan workspace/contents directory for HTML files
async function scanAndUpdateMetadata() {
    console.log('\n🔍 Scanning workspace/contents for HTML files...\n');

    const existingMetadata = loadMetadata();
    const existingFilenames = new Set(existingMetadata.map(m => m.filename));

    if (!fs.existsSync(CONTENTS_DIR)) {
        console.log('⚠️  Contents directory not found:', CONTENTS_DIR);
        return existingMetadata;
    }

    const files = fs.readdirSync(CONTENTS_DIR)
        .filter(file => file.endsWith('.html') && file !== 'posts-metadata.json');

    const newFiles = files.filter(file => !existingFilenames.has(file));

    if (newFiles.length === 0) {
        console.log('✓ All HTML files already have metadata entries.\n');
        return existingMetadata;
    }

    console.log(`📝 Found ${newFiles.length} new HTML file(s) without metadata:\n`);

    for (const file of newFiles) {
        console.log(`\n--- Processing: ${file} ---`);

        const htmlContent = loadContent(file);
        const autoMetadata = parseHtmlContent(htmlContent, file);

        console.log('\n🤖 Auto-detected metadata:');
        console.log(`   Title: ${autoMetadata.title || '(not found)'}`);
        console.log(`   Date: ${autoMetadata.date || '(not found)'}`);
        console.log(`   Author: ${autoMetadata.author}`);
        console.log(`   Description: ${autoMetadata.description || '(not found)'}`);
        console.log(`   Route: ${autoMetadata.route}`);

        // Ask user for confirmation and additional info
        const useAuto = await question('\n✓ Use auto-detected metadata? (y/n, default: y): ');

        let metadata = autoMetadata;

        if (useAuto.toLowerCase() === 'n') {
            metadata.title = await question(`Title [${autoMetadata.title}]: `) || autoMetadata.title;
            metadata.date = await question(`Date (YYYY-MM-DD) [${autoMetadata.date}]: `) || autoMetadata.date;
            metadata.author = await question(`Author [${autoMetadata.author}]: `) || autoMetadata.author;
            metadata.description = await question(`Description [${autoMetadata.description}]: `) || autoMetadata.description;
            metadata.route = await question(`Route [${autoMetadata.route}]: `) || autoMetadata.route;
        }

        // Ask for additional metadata
        metadata.keywords = await question('Keywords (comma separated): ') || '';
        metadata.image = await question(`OG Image path [images/${metadata.route}-og.jpg]: `) || `images/${metadata.route}-og.jpg`;

        existingMetadata.push(metadata);
        console.log(`✅ Metadata added for ${file}`);
    }

    // Save updated metadata
    const metadataPath = fs.existsSync(METADATA_PATH) ? METADATA_PATH : WORKSPACE_METADATA_PATH;
    fs.writeFileSync(metadataPath, JSON.stringify(existingMetadata, null, 4), 'utf8');
    console.log(`\n💾 Metadata saved to: ${metadataPath}`);

    return existingMetadata;
}

// Update metadata with current date for dateModified
function updateMetadata(posts) {
    const today = new Date().toISOString().split('T')[0];
    let updated = false;

    posts.forEach(post => {
        if (!post.dateModified || post.dateModified < today) {
            post.dateModified = today;
            updated = true;
        }
    });

    if (updated) {
        console.log('\n📝 Updating posts-metadata.json with current dateModified...');

        // Determine which file to update
        let metadataPath = METADATA_PATH;
        if (!fs.existsSync(METADATA_PATH) && fs.existsSync(WORKSPACE_METADATA_PATH)) {
            metadataPath = WORKSPACE_METADATA_PATH;
        }

        // Write updated metadata
        fs.writeFileSync(metadataPath, JSON.stringify(posts, null, 4), 'utf8');
        console.log(`✓ Metadata updated: ${metadataPath}`);
    }

    return posts;
}

// Load content file
function loadContent(filename) {
    try {
        const contentPath = path.join('./workspace/contents', filename);
        return fs.readFileSync(contentPath, 'utf8');
    } catch (error) {
        console.error(`Error loading content ${filename}:`, error);
        return '';
    }
}

// Create page template
function createTemplate(post, content) {
    const baseUrl = BASE_URL;
    const postUrl = `${baseUrl}/articles/${post.route}.html`;
    const imageUrl = post.image ? `${baseUrl}/${post.image}` : `${baseUrl}/images/og-default.jpg`;

    // Load asset versions for cache busting
    const assetVersions = getAssetVersions();
    const getVersionedAsset = (assetPath) => {
        const version = assetVersions[assetPath] || '1.0.0';
        // articles 폴더에 있으므로 상대 경로로 ../ 추가
        return `../${assetPath}?v=${version}`;
    };

    return `<!DOCTYPE html>
<html lang="ko" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} - KenesLab Blog</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="${post.description || ''}">
    <meta name="keywords" content="${post.keywords || ''}">
    <meta name="author" content="${post.author || 'KenesLab'}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.description || ''}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:site_name" content="KenesLab Blog">
    <meta property="og:locale" content="ko_KR">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:author" content="${post.author || 'KenesLab'}">

    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${post.title}">
    <meta name="twitter:description" content="${post.description || ''}">
    <meta name="twitter:image" content="${imageUrl}">

    <!-- Canonical URL -->
    <link rel="canonical" href="${postUrl}">

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <link rel="stylesheet" href="${getVersionedAsset('css/style.css')}">

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "${post.title}",
        "description": "${post.description || ''}",
        "image": "${imageUrl}",
        "datePublished": "${post.date}",
        "dateModified": "${post.dateModified || post.date}",
        "author": {
            "@type": "Organization",
            "name": "${post.author || 'KenesLab'}",
            "url": "${baseUrl}"
        },
        "publisher": {
            "@type": "Organization",
            "name": "KenesLab Blog",
            "logo": {
                "@type": "ImageObject",
                "url": "${baseUrl}/images/logo.png"
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${postUrl}"
        }
    }
    </script>

    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-TL8ZQ3G6');</script>
    <!-- End Google Tag Manager -->
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TL8ZQ3G6"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    <!-- Header Component -->
    <blog-header></blog-header>

    <!-- Main Content -->
    <main class="container">
        <div class="content-wrapper">
            <!-- Article Section -->
            <article class="main-content">
                ${content}
            </article>

            <!-- Sidebar -->
            <aside class="sidebar">
                <!-- Company Info Component -->
                <company-info></company-info>

                <!-- Contact Component -->
                <contact-section></contact-section>

                <!-- Recent Posts -->
                <recent-posts></recent-posts>
            </aside>
        </div>
    </main>

    <!-- Footer Component -->
    <blog-footer></blog-footer>

    <!-- Web Components -->
    <script src="${getVersionedAsset('js/analytics.js')}"></script>
    <script src="${getVersionedAsset('js/components/header.js')}"></script>
    <script src="${getVersionedAsset('js/components/footer.js')}"></script>
    <script src="${getVersionedAsset('js/components/company-info.js')}"></script>
    <script src="${getVersionedAsset('js/components/contact-section.js')}"></script>
    <script src="${getVersionedAsset('js/components/recent-posts.js')}"></script>
    <script src="${getVersionedAsset('js/theme.js')}"></script>
    <script src="${getVersionedAsset('js/syntax-highlighter.js')}"></script>
</body>
</html>`;
}

// Generate static pages
function generatePages() {
    let posts = loadMetadata();

    // Update metadata with current date
    posts = updateMetadata(posts);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log(`\n📄 Generating ${posts.length} static pages...`);    posts.forEach(post => {
        console.log(`Processing: ${post.title}`);

        // Load content
        const content = loadContent(post.filename);

        // Generate HTML
        const html = createTemplate(post, content);

        // Save to file
        const outputPath = path.join(OUTPUT_DIR, `${post.route}.html`);
        fs.writeFileSync(outputPath, html, 'utf8');

        console.log(`  ✓ Generated: ${outputPath}`);
    });

    console.log('\n✅ All static pages generated successfully!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);

    // Sync posts-metadata.json between workspace and root
    syncMetadata();

    // Generate sitemap.xml
    generateSitemap(posts);
}

// Sync posts-metadata.json between workspace and root
function syncMetadata() {
    const workspaceExists = fs.existsSync(WORKSPACE_METADATA_PATH);
    const rootExists = fs.existsSync(METADATA_PATH);

    if (workspaceExists && rootExists) {
        // Both exist - check which is newer and sync
        const workspaceStat = fs.statSync(WORKSPACE_METADATA_PATH);
        const rootStat = fs.statSync(METADATA_PATH);

        if (workspaceStat.mtime > rootStat.mtime) {
            fs.copyFileSync(WORKSPACE_METADATA_PATH, METADATA_PATH);
            console.log('✓ posts-metadata.json synced: workspace → root');
        } else if (rootStat.mtime > workspaceStat.mtime) {
            fs.copyFileSync(METADATA_PATH, WORKSPACE_METADATA_PATH);
            console.log('✓ posts-metadata.json synced: root → workspace');
        } else {
            console.log('✓ posts-metadata.json already in sync');
        }
    } else if (workspaceExists) {
        fs.copyFileSync(WORKSPACE_METADATA_PATH, METADATA_PATH);
        console.log('✓ posts-metadata.json copied to root');
    } else if (rootExists) {
        // Ensure workspace directory exists
        const workspaceDir = path.dirname(WORKSPACE_METADATA_PATH);
        if (!fs.existsSync(workspaceDir)) {
            fs.mkdirSync(workspaceDir, { recursive: true });
        }
        fs.copyFileSync(METADATA_PATH, WORKSPACE_METADATA_PATH);
        console.log('✓ posts-metadata.json copied to workspace');
    }
}

// Generate sitemap.xml
function generateSitemap(posts) {
    console.log('\n� Generating sitemap.xml...');

    const today = new Date().toISOString().split('T')[0];

    // Static pages configuration
    const staticPages = [
        { url: '', priority: '1.0', changefreq: 'weekly' },
        { url: 'posts.html', priority: '0.9', changefreq: 'weekly' },
        { url: 'about.html', priority: '0.7', changefreq: 'monthly' },
        { url: 'contact.html', priority: '0.6', changefreq: 'monthly' }
    ];

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

    <!-- Homepage -->
    <url>
        <loc>${BASE_URL}/</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Posts Page -->
    <url>
        <loc>${BASE_URL}/posts.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>

    <!-- About Page -->
    <url>
        <loc>${BASE_URL}/about.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>

    <!-- Contact Page -->
    <url>
        <loc>${BASE_URL}/contact.html</loc>
        <lastmod>${today}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>

    <!-- Blog Posts -->
`;

    // Add blog posts to sitemap
    posts.forEach(post => {
        const lastmod = post.dateModified || post.date || today;
        sitemapContent += `    <url>
        <loc>${BASE_URL}/articles/${post.route}.html</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

`;
    });

    sitemapContent += `</urlset>
`;

    // Write sitemap to file
    fs.writeFileSync(SITEMAP_PATH, sitemapContent, 'utf8');
    console.log(`✓ sitemap.xml generated successfully!`);
    console.log(`  - Total URLs: ${staticPages.length + posts.length}`);
    console.log(`  - Static pages: ${staticPages.length}`);
    console.log(`  - Blog posts: ${posts.length}`);
}

// Main execution
async function main() {
    console.log('🚀 KenesLab Blog - Static Page Generator\n');
    console.log('=' .repeat(50));

    try {
        // Step 1: Scan for new HTML files and update metadata
        await scanAndUpdateMetadata();

        // Step 2: Generate static pages
        generatePages();

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tasks completed successfully!');
        console.log('\n💡 Tip: Commit generated HTML files, posts-metadata.json, and sitemap.xml to Git.');
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the main function
main();
