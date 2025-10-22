#!/usr/bin/env node

/**
 * Static HTML Page Generator for SEO
 *
 * This script generates static HTML pages for each blog post
 * to improve SEO by providing crawlable content to search engines.
 *
 * Usage: node generate-static-pages.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const METADATA_PATH = './contents/posts-metadata.json';
const TEMPLATE_PATH = './page-template.html';
const OUTPUT_DIR = './static-pages';

// Load metadata
function loadMetadata() {
    try {
        const data = fs.readFileSync(METADATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading metadata:', error);
        process.exit(1);
    }
}

// Load content file
function loadContent(filename) {
    try {
        const contentPath = path.join('./contents', filename);
        return fs.readFileSync(contentPath, 'utf8');
    } catch (error) {
        console.error(`Error loading content ${filename}:`, error);
        return '';
    }
}

// Create page template
function createTemplate(post, content) {
    const baseUrl = 'https://keneslab.github.io/blog';
    const postUrl = `${baseUrl}/${post.route}`;
    const imageUrl = post.image ? `${baseUrl}/${post.image}` : `${baseUrl}/images/og-default.jpg`;

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

    <link rel="stylesheet" href="css/style.css">

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
    <script src="js/components/header.js"></script>
    <script src="js/components/footer.js"></script>
    <script src="js/components/company-info.js"></script>
    <script src="js/components/contact-section.js"></script>
    <script src="js/components/recent-posts.js"></script>
    <script src="js/theme.js"></script>
</body>
</html>`;
}

// Generate static pages
function generatePages() {
    const posts = loadMetadata();

    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log(`Generating ${posts.length} static pages...`);

    posts.forEach(post => {
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
    console.log('\n💡 Tip: Copy these files to your root directory to replace SPA routes with static pages for better SEO.');
}

// Run the generator
generatePages();
