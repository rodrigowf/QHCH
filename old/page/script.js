const QHCH_PATH = "https://raw.githubusercontent.com/rodrigowf/QHCH/refs/heads/main/QHCH.md";

// Local storage keys
const DARK_MODE_STORAGE_KEY = 'qhch_dark_mode';


// Function to load and set dark mode based on local storage
function initializeDarkMode() {
  const savedMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);
  const isDarkMode = savedMode !== undefined ? savedMode : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; // Default to dark mode
  
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  window.isDarkMode = isDarkMode;
  
  return isDarkMode;
}

// Function to toggle chat visibility
function toggleChat() {
    const chatRoot = document.getElementById('chat-root');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const toggleButton = document.getElementById('chat-toggle');
    const isVisible = chatRoot.style.display === 'block';

    if (isVisible) { // Deactivating Chat (going back to main)
        window.isChatOpen = false;
        window.onChatToggle(false);
        chatRoot.style.opacity = '0';
        chatRoot.style.transform = 'translateY(20px)';
        setTimeout(() => {
            chatRoot.style.display = 'none';
        }, 300);
        if (window.isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        document.body.classList.remove('chat-open');
        toggleButton.classList.remove('active');
        toggleButton.innerHTML = '<span class="material-icons">chat</span> Open Chat'; // Changed to use material icons
        darkModeToggle.style.display = 'block';
    } else { // Activating Chat (load Chat built react app)
        const darkMode = syncDarkMode();
        window.isChatOpen = true;
        window.onChatToggle(true, darkMode);
        chatRoot.style.display = 'block';
        // Force reflow
        chatRoot.offsetHeight;
        chatRoot.style.opacity = '1';
        chatRoot.style.transform = 'translateY(0)';
        document.body.classList.add('chat-open');
        toggleButton.classList.add('active');
        toggleButton.innerHTML = '<span class="material-icons">close</span> Close Chat'; // Changed to use material icons
        darkModeToggle.style.display = 'none';
    }
}

// Function to synchronize dark mode between page and chat
function syncDarkMode() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    console.log("IS DARK MODE:", isDarkMode);
    localStorage.setItem(DARK_MODE_STORAGE_KEY, JSON.stringify(isDarkMode));
    
    // Update the chat root background dynamically
    const chatRoot = document.getElementById('chat-root');
    if (chatRoot) {
        chatRoot.style.backgroundColor = isDarkMode ? '#161616' : 'white';
    }
    
    // Update dark mode icon using material icons
    const darkModeIcon = document.getElementById('dark-mode-icon');
    if (darkModeIcon) {
        darkModeIcon.innerHTML = isDarkMode ? '<span class="material-icons">light_mode</span>' : '<span class="material-icons">dark_mode</span>';
    }

    window.isDarkMode = isDarkMode;
    
    return isDarkMode;
}

// Update the toggleDarkMode function to use syncDarkMode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    return syncDarkMode();
}

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
    maxSize: 10,
    maxExpand: 100,
    maxWidth: '100vw',
    wrap: true
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
        
        // Add width constraints to all block elements
        const blockElements = contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre');
        blockElements.forEach(element => {
            element.style.maxWidth = '100%';
            element.style.overflowWrap = 'break-word';
        });

        // Handle math elements specifically
        const mathElements = document.querySelectorAll('.katex-display, .katex, .katex-html');
        mathElements.forEach(element => {
            element.style.maxWidth = '100vw';
            element.style.overflowX = 'auto';
            element.style.overflowY = 'hidden';
            
            // Force all child elements to stay within bounds
            const children = element.getElementsByTagName('*');
            for (let child of children) {
                child.style.maxWidth = '100vw';
            }
        });
        
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

// Update the DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting application');
    
    // Initialize dark mode
    const isDarkMode = initializeDarkMode();
    syncDarkMode(); // Ensure everything is synchronized
    
    // Add the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chat-toggle';
    toggleButton.innerHTML = '<span class="material-icons">chat</span> Open Chat'; // Changed to use material icons
    toggleButton.onclick = toggleChat;
    document.body.appendChild(toggleButton);

    // Create dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.innerHTML = `<span class="material-icons" id="dark-mode-icon">${isDarkMode ? 'light_mode' : 'dark_mode'}</span>`;
    darkModeToggle.title = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    darkModeToggle.onclick = toggleDarkMode;
    document.body.appendChild(darkModeToggle);

    // Style chat root for transitions
    const chatRoot = document.getElementById('chat-root');
    if (chatRoot) {
        chatRoot.style.transition = 'opacity 300ms, transform 300ms, background-color 300ms';
        chatRoot.style.opacity = '0';
        chatRoot.style.backgroundColor = isDarkMode ? '#161616' : 'white';
    }
    
    // Load markdown immediately
    loadMarkdown();
});

// Clean up loadMarkdown function
async function loadMarkdown() {
    console.log('Starting markdown loading process');
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${QHCH_PATH}?t=${timestamp}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load markdown file: ${response.status} ${response.statusText}`);
        }
        
        const content = await response.text();
        
        // Generate table of contents
        generateTOC(content);
        
        // Process markdown and LaTeX
        await processMarkdown(content);
        
        // Apply mobile styles AFTER content is loaded and rendered
        if (window.innerWidth <= 900) {
            setTimeout(() => {
                applyMobileStyles();
            }, 100);
        }
        
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

// New function to apply mobile styles after content is loaded
function applyMobileStyles() {
    // Apply mobile-specific styles programmatically
    const style = document.createElement('style');
    style.textContent = `
        .container {
            grid-template-columns: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
            display: block !important;
        }
        
        main {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 1rem !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
        }
        
        .katex-display, .katex, .katex-html {
            max-width: 100vw !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
        }
    `;
    document.head.appendChild(style);
    
    // Force reflow
    document.body.offsetHeight;
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