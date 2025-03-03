import { useState, useEffect } from 'react';
import { marked } from 'marked';

const QHCH_PATH = "./QHCH.md";

const generateTOC = (markdown) => {
  const headingRegex = /^(#{1,6})\s*(.+)$/gm;
  const toc = [];
  let match;
  let i = 0;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    const cleanText = text.replace(/[#*]/g, '');
    if (i > 1) toc.push({ level: level - 1, text: cleanText, id });
    i++;
  }
  return toc;
};

// Configure marked options
marked.use({
  mangle: false,
  headerIds: true,
  headerPrefix: '',
  gfm: true,
  breaks: true,
  smartLists: true,
  smartypants: true
});

const useMarkdown = () => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setTOC] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${QHCH_PATH}?t=${timestamp}`);
        if (!response.ok) {
          throw new Error(`Failed to load markdown: ${response.status} ${response.statusText}`);
        }
        const md = await response.text();
        setMarkdownContent(md);
        setTOC(generateTOC(md));
        const rendered = marked.parse(md);
        setHtmlContent(rendered);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setHtmlContent(`<div style='color:red;'>Error loading content: ${error.message}</div>`);
        setLoading(false);
      }
    };
    fetchMarkdown();
  }, []);

  return { markdownContent, htmlContent, toc, loading };
};

export default useMarkdown; 