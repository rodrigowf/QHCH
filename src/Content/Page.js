import React, { useRef, useEffect, useState } from 'react';
import { GlobalStyle, Container, Main, Loading } from './components/styled.components';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import 'katex/dist/katex.min.css';
import '@fontsource/material-icons';
import useMarkdown from './hooks/useMarkdown';
import AppHeader from './components/Header';
import TOC from './components/TOC';
import AppFooter from './components/AppFooter';

const ContentPage = ({ isDarkMode, toggleDarkMode, isMobile }) => {
  const { htmlContent, toc, loading } = useMarkdown();
  const [ isTocVisible, setIsTocVisible ] = useState(!isMobile);
  const contentRef = useRef(null);

  const toggleTOCVisible = () => {
    setIsTocVisible(prev => !prev);
  }

  useEffect(() => {
    setIsTocVisible(!isMobile); 
  }, [isMobile])

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
      <Container isTocVisible={isTocVisible} isMobile={isMobile}>
        <AppHeader 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
          isMobile={isMobile} 
          isTocVisible={isTocVisible} 
          toggleTOCVisible={toggleTOCVisible} 
        />
        {isTocVisible && (
          <TOC toc={toc} isMobile={isMobile} />
        )}
        <Main id="content" ref={contentRef} isMobile={isMobile}>
          {loading ? <Loading>Loading...</Loading> : <div dangerouslySetInnerHTML={{ __html: htmlContent }} />}
        </Main>
        <AppFooter />
      </Container>
    </div>
  );
};

export default ContentPage; 