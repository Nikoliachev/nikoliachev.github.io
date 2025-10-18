#!/usr/bin/env node
/**
 * Generate structure.json for GitHub Pages
 * Run this script before committing/deploying
 */

const fs = require('fs');
const path = require('path');

const DOCS_FOLDER = 'docs';

function generateStructure() {
    const structure = {};
    
    if (!fs.existsSync(DOCS_FOLDER)) {
        console.error(`Error: ${DOCS_FOLDER} folder not found!`);
        console.log(`Please create a '${DOCS_FOLDER}' folder with your markdown files.`);
        process.exit(1);
    }

    // Read all directories in docs folder
    const folders = fs.readdirSync(DOCS_FOLDER, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    if (folders.length === 0) {
        console.log(`Warning: No folders found in ${DOCS_FOLDER}/`);
        console.log('Create subfolders and add .md files to them.');
    }

    // For each folder, get all .md files
    folders.forEach(folder => {
        const folderPath = path.join(DOCS_FOLDER, folder);
        const files = fs.readdirSync(folderPath)
            .filter(file => file.endsWith('.md'))
            .sort();
        
        if (files.length > 0) {
            structure[folder] = files;
            console.log(`✓ Found ${files.length} file(s) in '${folder}'`);
        }
    });

    // Write structure.json
    fs.writeFileSync('structure.json', JSON.stringify(structure, null, 2));
    console.log('\n✓ Generated structure.json successfully!');
    console.log('You can now commit and push to GitHub Pages.\n');
    
    // Show structure
    console.log('Structure:');
    console.log(JSON.stringify(structure, null, 2));
}

// Run
try {
    generateStructure();
} catch (error) {
    console.error('Error generating structure:', error.message);
    process.exit(1);
}