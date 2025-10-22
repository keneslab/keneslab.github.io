#!/usr/bin/env node

/**
 * Asset Version Updater for Cache Busting
 *
 * This script updates CSS and JS file version numbers in HTML files
 * to force browser cache refresh when assets are updated.
 *
 * Usage: node workspace/bin/update-asset-versions.js [options]
 * Options:
 *   --increment-all    : Increment all asset versions
 *   --increment <file> : Increment specific asset version (e.g., css/style.css)
 *   --major            : Increment major version (default: patch)
 *   --minor            : Increment minor version (default: patch)
 *
 * Examples:
 *   node workspace/bin/update-asset-versions.js --increment-all
 *   node workspace/bin/update-asset-versions.js --increment css/style.css --major
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const VERSION_FILE = './workspace/bin/asset-versions.json';
const HTML_FILES = [
    './index.html',
    './about.html',
    './contact.html',
    './posts.html'
];
const ASSET_FILES = [
    'css/style.css',
    'js/analytics.js',
    'js/theme.js',
    'js/components/header.js',
    'js/components/footer.js',
    'js/components/company-info.js',
    'js/components/contact-section.js',
    'js/components/recent-posts.js',
    'js/components/posts-list.js'
];

// Parse command line arguments
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        incrementAll: false,
        incrementFile: null,
        versionType: 'patch', // major, minor, patch
        useHash: false
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--increment-all':
                options.incrementAll = true;
                break;
            case '--increment':
                options.incrementFile = args[++i];
                break;
            case '--major':
                options.versionType = 'major';
                break;
            case '--minor':
                options.versionType = 'minor';
                break;
            case '--patch':
                options.versionType = 'patch';
                break;
            case '--hash':
                options.useHash = true;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
        }
    }

    return options;
}

function printHelp() {
    console.log(`
Asset Version Updater for Cache Busting

Usage: node workspace/bin/update-asset-versions.js [options]

Options:
  --increment-all    : Increment all asset versions
  --increment <file> : Increment specific asset version (e.g., css/style.css)
  --major            : Increment major version (default: patch)
  --minor            : Increment minor version (default: patch)
  --patch            : Increment patch version (default)
  --hash             : Use file hash instead of semantic versioning
  --help, -h         : Show this help message

Examples:
  node workspace/bin/update-asset-versions.js --increment-all
  node workspace/bin/update-asset-versions.js --increment css/style.css --major
  node workspace/bin/update-asset-versions.js --hash
`);
}

// Load version file
function loadVersions() {
    if (!fs.existsSync(VERSION_FILE)) {
        console.log('⚠️  Version file not found. Creating new one...');
        const versions = {};
        ASSET_FILES.forEach(file => {
            versions[file] = '1.0.0';
        });
        fs.writeFileSync(VERSION_FILE, JSON.stringify(versions, null, 4), 'utf8');
        return versions;
    }

    try {
        const data = fs.readFileSync(VERSION_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error loading version file:', error);
        process.exit(1);
    }
}

// Save version file
function saveVersions(versions) {
    try {
        fs.writeFileSync(VERSION_FILE, JSON.stringify(versions, null, 4), 'utf8');
        console.log('✓ Version file updated');
    } catch (error) {
        console.error('❌ Error saving version file:', error);
        process.exit(1);
    }
}

// Increment version number
function incrementVersion(version, type = 'patch') {
    const parts = version.split('.').map(Number);
    let [major, minor, patch] = parts;

    switch (type) {
        case 'major':
            major++;
            minor = 0;
            patch = 0;
            break;
        case 'minor':
            minor++;
            patch = 0;
            break;
        case 'patch':
        default:
            patch++;
            break;
    }

    return `${major}.${minor}.${patch}`;
}

// Generate file hash
function generateFileHash(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error.message);
        return null;
    }
}

// Update versions based on options
function updateVersions(versions, options) {
    const updatedFiles = [];

    if (options.useHash) {
        // Use file hash for all assets
        ASSET_FILES.forEach(file => {
            const filePath = `./${file}`;
            const hash = generateFileHash(filePath);
            if (hash) {
                versions[file] = hash;
                updatedFiles.push(file);
            }
        });
    } else if (options.incrementAll) {
        // Increment all versions
        Object.keys(versions).forEach(file => {
            versions[file] = incrementVersion(versions[file], options.versionType);
            updatedFiles.push(file);
        });
    } else if (options.incrementFile) {
        // Increment specific file version
        if (versions[options.incrementFile]) {
            versions[options.incrementFile] = incrementVersion(
                versions[options.incrementFile],
                options.versionType
            );
            updatedFiles.push(options.incrementFile);
        } else {
            console.error(`❌ File not found in versions: ${options.incrementFile}`);
            process.exit(1);
        }
    } else {
        // Auto-detect changes and update versions
        console.log('🔍 Checking for file changes...');
        ASSET_FILES.forEach(file => {
            const filePath = `./${file}`;
            if (fs.existsSync(filePath)) {
                const hash = generateFileHash(filePath);
                if (hash) {
                    // Check if file has changed (simplified approach)
                    versions[file] = incrementVersion(versions[file], 'patch');
                    updatedFiles.push(file);
                }
            }
        });
    }

    return updatedFiles;
}

// Update HTML files with new versions
function updateHtmlFiles(versions) {
    console.log('\n📝 Updating HTML files...');

    HTML_FILES.forEach(htmlFile => {
        if (!fs.existsSync(htmlFile)) {
            console.log(`  ⚠️  Skipping ${htmlFile} (not found)`);
            return;
        }

        try {
            let content = fs.readFileSync(htmlFile, 'utf8');
            let modified = false;

            // Update each asset link
            Object.entries(versions).forEach(([file, version]) => {
                // Match both href and src attributes
                // Pattern: href="file" or src="file" (with or without existing version)
                const patterns = [
                    // href patterns
                    new RegExp(`href=["']${file}\\?v=[^"']*["']`, 'g'),
                    new RegExp(`href=["']${file}["']`, 'g'),
                    // src patterns
                    new RegExp(`src=["']${file}\\?v=[^"']*["']`, 'g'),
                    new RegExp(`src=["']${file}["']`, 'g')
                ];

                patterns.forEach((pattern, index) => {
                    const attr = index < 2 ? 'href' : 'src';
                    const replacement = `${attr}="${file}?v=${version}"`;
                    const newContent = content.replace(pattern, replacement);
                    if (newContent !== content) {
                        content = newContent;
                        modified = true;
                    }
                });
            });

            if (modified) {
                fs.writeFileSync(htmlFile, content, 'utf8');
                console.log(`  ✓ Updated: ${htmlFile}`);
            } else {
                console.log(`  - No changes: ${htmlFile}`);
            }
        } catch (error) {
            console.error(`  ❌ Error updating ${htmlFile}:`, error.message);
        }
    });
}

// Export function for use in other scripts
function getAssetVersions() {
    return loadVersions();
}

// Main execution
function main() {
    console.log('🚀 Asset Version Updater\n');
    console.log('='.repeat(50));

    const options = parseArguments();
    const versions = loadVersions();

    console.log('\n📋 Current versions:');
    Object.entries(versions).forEach(([file, version]) => {
        console.log(`  ${file}: ${version}`);
    });

    const updatedFiles = updateVersions(versions, options);

    if (updatedFiles.length > 0) {
        console.log('\n✨ Updated versions:');
        updatedFiles.forEach(file => {
            console.log(`  ${file}: ${versions[file]}`);
        });

        saveVersions(versions);
        updateHtmlFiles(versions);

        console.log('\n' + '='.repeat(50));
        console.log('✅ Asset versions updated successfully!');
        console.log('\n💡 Tip: Commit asset-versions.json and updated HTML files to Git.');
    } else {
        console.log('\n⚠️  No versions were updated. Use --increment-all or --increment <file>');
        console.log('   Run with --help for more options.');
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

// Export for use in other scripts
module.exports = {
    getAssetVersions,
    loadVersions,
    saveVersions,
    incrementVersion,
    updateHtmlFiles
};
