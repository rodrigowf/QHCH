import styled, { createGlobalStyle } from 'styled-components';

// Global styles converted from styles.css
export const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    --background-color: #f8f9fa;
    --text-color: #2c3e50;
    --border-color: #e9ecef;
    --header-bg: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    --code-bg: #f5f7f9;
    --blockquote-bg: #f8f9fa;
    --toc-hover-bg: #f8f9fa;
    --toc-bg: #ffffff;
    --main-bg: #ffffff;
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --transition-speed: 0.3s;
    --toc-width: 300px;
    --content-width: 1200px;
    --mobile-width: 900px;
    --text-shadow: 0 3px 6px rgba(0,0,0,0.3);
  }


  /* Dark mode variables */
  .dark-mode {
      --primary-color: #93c5fd;
      --secondary-color: #38bdf8;
      --accent-color: #f87171;
      --background-color: #161616;
      --text-color: #e2e8f0;
      --border-color: #2d3748;
      --header-bg: linear-gradient(135deg, #313a47 0%, #195ba7 100%);
      --code-bg: #282c34;
      --blockquote-bg: #212121;
      --toc-hover-bg: #2d3748;
      --toc-bg: #161616;
      --main-bg: #161616;
      --shadow-sm: 0 2px 4px rgba(0,0,0,0.5);
      --shadow-md: 0 4px 6px rgba(0,0,0,0.5);
      --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
  }

  /* Base resets */
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: 100vw; overflow-x: hidden; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    min-height: 100vh;
    position: relative;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: var(--background-color); border-radius: 4px; }
  ::-webkit-scrollbar-thumb { background-color: var(--secondary-color); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background-color: var(--primary-color); }
`;

// Styled components
export const Container = styled.div`
  display: grid;
  grid-template-columns: var(--toc-width) minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
  gap: 2rem;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
`;

export const Header = styled.header`
  grid-area: header;
  background: var(--header-bg);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 10;
  transition: padding var(--transition-speed) ease-in-out;
  width: 100%;
  box-sizing: border-box;
`;

export const HeaderContent = styled.div`
  .header-content & { }
`;

export const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

export const Subtitle = styled.p`
  font-size: 1.4rem;
  opacity: 0.9;
  font-weight: 300;
`;

export const Links = styled.p`
  margin-top: 1rem;
  font-size: 1rem;
  a {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all var(--transition-speed);
    opacity: 0.9;
    &:hover { background: rgba(255,255,255,0.2); opacity: 1; text-decoration: underline; }
  }
`;

export const Nav = styled.nav`
  grid-area: nav;
  background: var(--toc-bg);
  padding: 2rem 0;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100%;
  max-height: fit-content;
  box-shadow: var(--shadow-sm);
`;

export const TOCTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding: 0 2rem;
  font-weight: 700;
`;

export const TOCList = styled.ul`
  list-style: none;
  padding: 0 1rem;
`;

export const TOCItem = styled.li`
  margin: 0.5rem 0;
  margin-left: ${props => (props.level - 1) * 16}px;
  font-weight: ${props => (props.level === 1 ? '600' : '400')};
`;

export const TOCLink = styled.a`
  color: var(--text-color);
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  display: block;
  transition: all var(--transition-speed);
  opacity: 0.9;
  &:hover { 
    color: var(--secondary-color);
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(8px);
    opacity: 1;
  }
`;

export const Main = styled.main`
  grid-area: main;
  padding: 2rem;
  background: var(--main-bg);
  max-width: var(--content-width);
  width: 100%;
  box-shadow: var(--shadow-sm);
  border-radius: 8px;
  min-width: 0;
  overflow-wrap: break-word;
  overflow-x: hidden;
  margin: auto;
  color: var(--text-color);

  h1, h2, h3, h4 {
    color: var(--text-color);
    margin: 2rem 0 1rem;
    font-weight: 700;
    line-height: 1.3;
  }

  h1 { 
    font-size: 2.5rem; 
    border-bottom: 2px solid var(--text-color);
    padding-bottom: 0.5rem;
    margin-top: 0;
  }

  em {
    color: var(--secondary-color);
  }

  h2 { 
    font-size: 2rem;
    color: var(--secondary-color);
  }

  h3 { 
    font-size: 1.5rem;
    color: var(--primary-color);
  }

  h4 { font-size: 1.2rem; }

  p {
    margin-bottom: 1.5rem;
    line-height: 1.8;
    font-size: 1.1rem;
  }

  ul, ol {
    margin: 1.5rem 0;
    padding-left: 2rem;
  }

  li {
    margin: 0.75rem 0;
    line-height: 1.6;
  }

  code {
    background: var(--code-bg);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.9em;
    color: var(--accent-color);
  }

  pre {
    background: var(--code-bg);
    padding: 1.5rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
    box-shadow: var(--shadow-sm);
  }

  pre code {
    background: none;
    padding: 0;
    color: inherit;
  }

  blockquote {
    border-left: 4px solid var(--secondary-color);
    padding: 1.5rem;
    margin: 1.5rem 0;
    background: var(--blockquote-bg);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    color: #666;
    box-shadow: var(--shadow-sm);
  }
`;

export const Footer = styled.footer`
  grid-area: footer;
  text-align: center;
  padding: 2rem;
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-lg);
`;

export const Loading = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--secondary-color);
  font-size: 1.4rem;
  animation: pulse 2s infinite;
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

