const QHPH_PATH = "https://github.com/rodrigowf/QHPH/blob/main/QHPH.md";

// Configure marked options
marked.use({
    mangle: false,
    headerIds: true,
    headerPrefix: '',
    gfm: true,
    breaks: true,
    smartLists: true,
    smartypants: true,
    // Add custom tokenizer and renderer for LaTeX and headers
    extensions: [{
        name: 'latex',
        level: 'inline',
        start(src) {
            return src.match(/\\\[|\\\(/)?.index;
        },
        tokenizer(src) {
            const displayMatch = /^\\\[([\s\S]*?)\\\]/.exec(src);
            if (displayMatch) {
                return {
                    type: 'latex',
                    raw: displayMatch[0],
                    text: displayMatch[1],
                    display: true
                };
            }
            
            const inlineMatch = /^\\\(([\s\S]*?)\\\)/.exec(src);
            if (inlineMatch) {
                return {
                    type: 'latex',
                    raw: inlineMatch[0],
                    text: inlineMatch[1],
                    display: false
                };
            }
        },
        renderer(token) {
            if (token.display) {
                return `<div class="math-display">\\[${token.text}\\]</div>`;
            } else {
                return `<span class="math-inline">\\(${token.text}\\)</span>`;
            }
        }
    }],
    renderer: {
        heading(text, level) {
            // Remove the ID part from the displayed text if present
            const displayText = text.replace(/\s*\{#[\w-]+\}\s*$/, '');
            const id = displayText.toLowerCase().replace(/[^\w]+/g, '-');
            return `<h${level} id="${id}">${displayText}</h${level}>`;
        }
    }
});

// Clean up markdown content before processing
function cleanMarkdown(content) {
    // Log original content for debugging
    console.log('Original content sample:', content.slice(0, 500));
    
    // Clean up the content
    content = content
        // Remove markdown formatting from titles while preserving text
        .replace(/^(#{1,6})\s*\*\*(.+?)\*\*\s*$/gm, '$1 $2')
        // Clean up extra newlines
        .replace(/\n{3,}/g, '\n\n')
        // Add newlines around display math for better parsing
        .replace(/(^|\n)\s*(\\\[[\s\S]*?\\\])\s*($|\n)/g, '\n\n$2\n\n');
    
    // Log processed content for debugging
    console.log('Processed content sample:', content.slice(0, 500));
    
    return content;
}

console.log('Marked configured successfully');

// Configure KaTeX options
const katexOptions = {
    delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false }
    ],
    throwOnError: false,
    output: 'html',
    trust: true,
    strict: false,
    macros: {
        "\\mathrm": "\\text",
        "\\Psi": "\\psi",
        "\\Bigl": "\\left",
        "\\Bigr": "\\right"
    },
    displayMode: true,
    minRuleThickness: 0.05,
    maxSize: 50,
    maxExpand: 1000
};

console.log('KaTeX options configured');

// Function to generate table of contents
function generateTOC(content) {
    console.log('Generating TOC from content length:', content.length);
    const headings = [];
    const headingRegex = /^(#{1,6})\s*(?:\*\*)?([^*\n]+?)(?:\*\*)?\s*$/gm;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text.toLowerCase().replace(/[^\w]+/g, '-');
        headings.push({ level, text, id });
    }

    console.log('Found headings:', headings.length);
    
    const toc = document.getElementById('toc');
    toc.innerHTML = ''; // Clear existing content
    
    const tocTitle = document.createElement('h2');
    tocTitle.textContent = 'Contents';
    tocTitle.className = 'toc-title';
    toc.appendChild(tocTitle);
    
    const ul = document.createElement('ul');
    ul.className = 'toc-list';
    
    let currentList = ul;
    let currentLevel = 1;
    let listStack = [ul];
    
    headings.forEach((heading, index) => {
        while (heading.level > currentLevel) {
            const li = listStack[listStack.length - 1].lastElementChild || listStack[listStack.length - 1].appendChild(document.createElement('li'));
            const newList = document.createElement('ul');
            newList.className = 'toc-sublist';
            li.appendChild(newList);
            listStack.push(newList);
            currentList = newList;
            currentLevel++;
        }
        
        while (heading.level < currentLevel) {
            listStack.pop();
            currentLevel--;
            currentList = listStack[listStack.length - 1];
        }
        
        const li = document.createElement('li');
        li.className = `toc-item toc-level-${heading.level}`;
        
        const a = document.createElement('a');
        a.href = `#${heading.id}`;
        a.textContent = heading.text;
        a.className = 'toc-link';
        
        li.appendChild(a);
        currentList.appendChild(li);
    });
    
    toc.appendChild(ul);
    console.log('TOC generation completed');
}

// Function to process markdown content
async function processMarkdown(content) {
    try {
        console.log('Processing markdown content length:', content.length);
        
        // Clean up the markdown content
        content = cleanMarkdown(content);
        console.log('Markdown cleaned');
        
        // Count LaTeX equations before rendering
        const displayMathCount = (content.match(/\\\[[\s\S]*?\\\]/g) || []).length;
        const inlineMathCount = (content.match(/\\\([\s\S]*?\\\)/g) || []).length;
        console.log(`Found ${displayMathCount} display and ${inlineMathCount} inline equations`);
        
        // Render markdown
        const htmlContent = marked.parse(content);
        console.log('Markdown rendered to HTML');
        
        // Log a sample of the rendered HTML for debugging
        console.log('Rendered HTML sample:', htmlContent.slice(0, 500));
        
        // Update content
        const contentElement = document.getElementById('content');
        contentElement.innerHTML = htmlContent;
        console.log('HTML content updated in DOM');
        
        // Render LaTeX
        console.log('Starting LaTeX rendering');
        await renderMathInElement(contentElement, {
            ...katexOptions,
            errorCallback: function(msg, err) {
                console.log('KaTeX error:', msg, err);
            }
        });
        
        // Add special styling for display math
        const displayMath = contentElement.querySelectorAll('.katex-display, .math-display');
        console.log('Found display math elements:', displayMath.length);
        
        // No additional styling needed since it's handled in CSS
        
        console.log('LaTeX rendering completed');
    } catch (error) {
        console.error('Error in processMarkdown:', error);
        document.getElementById('content').innerHTML = `
            <div class="error">
                Failed to process content. Please try refreshing the page.
                <br>
                Error: ${error.message}
                <br>
                <pre>${error.stack}</pre>
            </div>
        `;
    }
}

// Function to load and process the markdown file
async function loadMarkdown() {
    console.log('Starting markdown loading process');
    try {
        console.log('Fetching QHPH.md');
        const timestamp = new Date().getTime();
        const response = await fetch(`${QHPH_PATH}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load markdown file: ${response.status} ${response.statusText}`);
        }
        
        console.log('Markdown file fetched successfully');
        const content = await response.text();
        console.log('Markdown content loaded, length:', content.length);
        
        // Generate table of contents
        generateTOC(content);
        
        // Process markdown and LaTeX
        await processMarkdown(content);
        
    } catch (error) {
        console.error('Error in loadMarkdown:', error);
        document.getElementById('content').innerHTML = `
            <div class="error">
                Failed to load content. Please try refreshing the page.
                <br>
                Error: ${error.message}
            </div>
        `;
    }
}

// Add smooth scrolling for TOC links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.hash) {
        e.preventDefault();
        const targetElement = document.querySelector(e.target.hash);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, '', e.target.hash);
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting application');
    loadMarkdown();
}); 