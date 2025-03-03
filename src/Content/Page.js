import React, { useRef, useEffect } from 'react';
import { GlobalStyle, Container, Main, Loading } from './components/styled.components';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import '@fontsource/material-icons';
import useMarkdown from './hooks/useMarkdown';
import AppHeader from './components/Header';
import TOC from './components/TOC';
import AppFooter from './components/AppFooter';

const ContentPage = ({ isDarkMode, toggleDarkMode }) => {
  const { htmlContent, toc, loading } = useMarkdown();
  const contentRef = useRef(null);

  // After content is rendered, render math using KaTeX auto-render if available
  useEffect(() => {
    if (contentRef.current) {
      renderMathInElement(contentRef.current, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false,
        output: 'html',
        trust: true
      });
    }
  }, [htmlContent]);

  return (
    <div className={isDarkMode ? 'dark-mode' : ''}>
      <GlobalStyle />
      <Container>
        <AppHeader isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <TOC toc={toc} />
        <Main id="content" ref={contentRef}>
          {loading ? <Loading>Loading...</Loading> : <div dangerouslySetInnerHTML={{ __html: htmlContent }} />}
        </Main>
        <AppFooter />
      </Container>
    </div>
  );
};

export default ContentPage; 