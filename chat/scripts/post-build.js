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

// Create a chat div for the root index.html
const chatHtml = `
<div id="chat-root" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 1000;">
    <div id="root"></div>
</div>
`;

// Update the root index.html
let indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Add chat assets before </body>
const chatAssets = `
    <!-- Chat Application -->
    <link href="assets/chat.css" rel="stylesheet">
    <script src="assets/chat.js"></script>
    ${chatHtml}
`;

indexHtml = indexHtml.replace('</body>', `${chatAssets}\n</body>`);

// Write the updated index.html
fs.writeFileSync(path.join(rootDir, 'index.html'), indexHtml);
console.log('Updated index.html with chat application assets');