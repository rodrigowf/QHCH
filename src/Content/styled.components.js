import styled, { createGlobalStyle } from 'styled-components';

/* 
  Consolidated GlobalStyle combines:
    • Global CSS variables (light and dark mode)
    • Base resets and scrollbar styling
    • Dark mode overrides for global elements
*/
export const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    --background-color: #f8f9fa;
    --text-color: #2c3e50;
    --border-color:rgba(219, 220, 222, 20);
    --header-bg: linear-gradient(-60deg, 
      rgb(21, 53, 85) 0%, 
      rgb(39, 78, 110) 25%,
      rgb(75, 120, 150) 50%,
      rgb(22, 59, 88) 75%,
      rgb(21, 53, 85) 100%
    );
    --header-gradient-animation: gradient 8s ease infinite;
    --gradient-size: 300% 300%;
    --footer-bg: #3498db;
    --code-bg: #f5f7f9bb;
    --blockquote-bg: #f8f9fa;
    --toc-hover-bg: #f8f9fa;
    --toc-bg: #ffffff;
    --main-bg: #ffffff;
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.07);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --transition-speed: 0.3s;
    --toc-width: 300px;
    --content-width: 1000px;
    --mobile-width: 900px;
    --text-shadow: 0 3px 6px rgba(0,0,0,0.3);
  }

  /* Dark mode variables */
  .dark-mode {
    --primary-color: #93c5fd;
    --secondary-color:rgb(91, 174, 209);
    --accent-color: #f87171;
    --background-color: #161616;
    --text-color: #e2e8f0;
    --border-color: rgba(44, 44, 55, 100);
    --header-bg: linear-gradient(-55deg, #0a0d15 0%, #1d312eeb 25%, #172f4bc7 50%, #232443b5 75%, #06090b 100%);

    --footer-bg:rgb(37, 79, 108);
    --code-bg: #282c3444;
    --blockquote-bg: #212121;
    --toc-hover-bg: #2d3748;
    --toc-bg: #181818;
    --main-bg: #1b1b1b;
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.25);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.3);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.3);

    /* Add KaTeX specific dark mode overrides */
    .katex {
      color: var(--text-color);
    }
    
    .katex-display {
      color: var(--text-color);
      background: var(--code-bg);
      padding: 1rem;
      border-radius: 8px;
      margin: 1.5rem 0;
      overflow-x: auto;
      box-shadow: var(--shadow-sm);
    }

    /* Style inline math in dark mode */
    .katex-inline {
      color: var(--text-color);
      background: var(--code-bg);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }
  }

  /* Add base KaTeX styling */
  .katex-display {
    overflow-x: auto;
    overflow-y: hidden;
    padding: 1rem;
    margin: 1.5rem 0;
    background: var(--code-bg);
    border-radius: 8px;
    box-shadow: var(--shadow-sm);
  }

  .katex-inline {
    padding: 0.2rem 0.4rem;
    background: var(--code-bg);
    border-radius: 4px;
  }

  /* Base resets */
  *, *::before, *::after {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 100vw;
    overflow-x: hidden;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    min-height: 100vh;
    position: relative;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: var(--background-color);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--secondary-color);
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--primary-color);
  }

  /* Dark mode overrides for global elements */
  .dark-mode {
    scrollbar-color: #2d3748 #161616;
    background-color: #161616;
  }
  .dark-mode main {
    background: var(--main-bg);
    color: var(--text-color);
  }
  .dark-mode main h1 {
    color: var(--text-color);
  }
  .dark-mode main h2 {
    color: var(--secondary-color);
  }
  .dark-mode main h3,
  .dark-mode main h4 {
    color: var(--primary-color);
  }
  .dark-mode main p,
  .dark-mode main li {
    color: var(--text-color);
  }
  .dark-mode .toc-title {
    color: var(--text-color);
  }
  .dark-mode .toc-sublist {
    border-left-color: var(--border-color);
  }
  /* Chat toggle and Dark mode toggle overrides */
  .dark-mode #chat-toggle {
    background-color: #1565c0;
  }
  .dark-mode #chat-toggle:hover {
    background-color: #0d47a1;
  }
  .dark-mode #chat-toggle.active {
    background-color: #d32f2f;
  }
  .dark-mode #chat-toggle.active:hover {
    background-color: #b71c1c;
  }
  .dark-mode #dark-mode-toggle {
    background-color: #3f7fc9;
  }
  .dark-mode #dark-mode-toggle:hover {
    background-color: #658cc6;
    transform: translateY(-1px);
  }
  /* Chat root styling */
  #chat-root {
    background-color: white;
  }
  .dark-mode #chat-root {
    background-color: #161616;
  }

  /* Update gradient animation keyframes */
  @keyframes gradient {
    0% {
      background-position: 300% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

/* Styled component definitions */

const gridStyle = `
  display: grid;
  grid-template-columns: var(--toc-width) minmax(0, 1fr);
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  grid-template-areas:
    "header header"
    "nav main"
    "footer footer";
  gap: 2rem;
`;

export const Container = styled.div`
  ${props => props.isMobile ? 'display: block;' : gridStyle}
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
`;

export const Header = styled.header`
  grid-area: header;
  background: var(--header-bg);
  background-size: var(--gradient-size);
  animation: gradient 25s linear infinite;
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
    &:hover { 
      background: rgba(255,255,255,0.2); 
      opacity: 1; 
      text-decoration: underline;
    }
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
  padding: ${props => props.isMobile ? '2rem 1.4rem' : '2rem'};
  margin: ${props => props.isMobile ? '0 0.5rem' : 'auto'};
  width: ${props => props.isMobile ? 'calc(100% - 1rem)' : '100%'};
  max-width: var(--content-width);
  background: var(--main-bg);
  box-shadow: var(--shadow-md);
  border-radius: 8px;
  min-width: 0;
  overflow-wrap: break-word;
  overflow-x: hidden;
  color: var(--text-color);

  h1, h2, h3, h4 {
    color: var(--text-color);
    margin: 0;
    padding: 1.5rem 0 1rem;
    font-weight: 700;
    line-height: 1.3;
  }
  h1 { 
    font-size: 2.5rem; 
    border-bottom: 2px solid var(--text-color);
    padding-bottom: 1.3rem;
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
  h4 { 
    font-size: 1.2rem;
  }
  p {
    margin: 1.5rem 0;
    line-height: 1.8;
    font-size: 1.1rem;
  }
  hr {
    margin: 42px 0;
    opacity: 0.35;
  }
  ul, ol {
    margin: 1rem 0;
    padding-left: ${props => props.isMobile ? '0.8rem' : '2rem'};
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
  background: var(--footer-bg);
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

