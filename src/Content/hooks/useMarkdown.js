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
    const text = match[2].trim().replace(/\*\*(.*?)\*\*/g, '$1');
    if (i > 0) {
      const id = `title-${i - 1}`;
      toc.push({ level: level - 1, text, id });
    }
    i++;
  }
  return toc;
};

// Configure marked options
const markedOptions = {
  mangle: false,
  headerIds: true,
  headerPrefix: '',
  gfm: true,
  breaks: true,
  smartLists: true,
  smartypants: true
};

marked.setOptions(markedOptions);

const processHtmlIds = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headers = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headers.forEach((header, index) => {
    // Skip the first two headers (i > 1 like in TOC)
    if (index > 1) {
      const id = `title-${index - 1}`;
      header.id = id;
    }
  });

  return doc.body.innerHTML;
};

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
        const rendered = marked.parse(md, markedOptions);
        const processedHtml = processHtmlIds(rendered);
        setHtmlContent(processedHtml);
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