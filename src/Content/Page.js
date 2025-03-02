import React, { useState, useEffect, useRef } from 'react';
import { GlobalStyle, Container, Header, Main, Footer, Loading, Title, Subtitle, Links, Nav, TOCTitle, TOCList, TOCItem, TOCLink } from './styled.components';
import { marked } from 'marked';
import 'katex/dist/katex.min.css';
import '@fontsource/material-icons';

import QHPH_PATH from './QHPH.md';


// Helper function to generate TOC entries from markdown content
const generateTOC = (markdown) => {
  const headingRegex = /^(#{1,6})\s*(.+)$/gm;
  const toc = [];
  let match;
  let i = 0;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[\W]+/g, '-');
    const cleanText = text.replace('#', '').replace('**', '').replace('*', '').replace('*', ''); // Parse inline markdown to clean text
    if (i > 1) toc.push({ level: level-1, text: cleanText, id });
    i ++;
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

const ContentPage = () => {
  const [markdownContent, setMarkdownContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setTOC] = useState([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${QHPH_PATH}?t=${timestamp}`);
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

  // After content is rendered, render math using KaTeX auto-render if available
  useEffect(() => {
    if (contentRef.current) {
      import('katex/dist/contrib/auto-render').then(({ default: renderMathInElement }) => {
        renderMathInElement(contentRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false,
          output: 'html',
          trust: true
        });
      });
    }
  }, [htmlContent]);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header id="main-header">
          <div className="header-content">
            <Title>Quantum Holographic Perception Hypothesis</Title>
            <Subtitle>A Unified Framework for Consciousness and Reality</Subtitle>
            <Links>
              <a href="https://github.com/rodrigowf/QHPH" target="_blank" rel="noopener noreferrer">GitHub Repository</a> |
              <a href="https://github.com/rodrigowf/QHPH/blob/main/QHPH.md" target="_blank" rel="noopener noreferrer">View Raw Markdown</a>
            </Links>
          </div>
        </Header>
        <Nav id="toc">
          <TOCTitle>Contents</TOCTitle>
          <TOCList>
            {toc.map((item, index) => (
              <TOCItem key={index} level={item.level} className={`toc-item toc-level-${item.level}`}>
                <TOCLink href={`#${item.id}`} className="toc-link">{item.text}</TOCLink>
              </TOCItem>
            ))}
          </TOCList>
        </Nav>
        <Main id="content" ref={contentRef}>
          {loading ? <Loading>Loading...</Loading> : <div dangerouslySetInnerHTML={{ __html: htmlContent }} />}
        </Main>
        <Footer>
          <p>© 2024 Rodrigo Werneck Franco. All rights reserved.</p>
        </Footer>
      </Container>
    </>
  );
};

export default ContentPage; 