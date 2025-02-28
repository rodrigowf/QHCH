const fs = require('fs');
const path = require('path');

// Paths
const buildDir = path.join(__dirname, '../build');
const rootDir = path.join(__dirname, '../../');
const assetsDir = path.join(rootDir, 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Function to copy and rename files
function copyAndRename(srcPath, destPath) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcPath} to ${destPath}`);
}

// Process the build directory
fs.readdir(path.join(buildDir, 'static/js'), (err, files) => {
    if (err) throw err;
    
    // Find and copy the main JS file
    const mainJs = files.find(f => f.startsWith('main.') && f.endsWith('.js'));
    if (mainJs) {
        copyAndRename(
            path.join(buildDir, 'static/js', mainJs),
            path.join(assetsDir, 'chat.js')
        );
    }
});

fs.readdir(path.join(buildDir, 'static/css'), (err, files) => {
    if (err) throw err;
    
    // Find and copy the main CSS file
    const mainCss = files.find(f => f.startsWith('main.') && f.endsWith('.css'));
    if (mainCss) {
        copyAndRename(
            path.join(buildDir, 'static/css', mainCss),
            path.join(assetsDir, 'chat.css')
        );
    }
});