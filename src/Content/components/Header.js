import React from 'react';
import { Header, Title, Subtitle, Links } from '../styled.components';
import { Tooltip, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';


const AppHeader = ({ isDarkMode, toggleDarkMode, isMobile, isTocVisible, toggleTOCVisible }) => {
  return (
    <Header id="main-header">
      <div className="header-content">
        <Title>Quantum Holographic Consciousness Hypothesis</Title>
        <Subtitle>A Unified Framework for Consciousness and Reality</Subtitle>
        <Links isMobile={isMobile}>
          <a href="https://github.com/rodrigowf/QHCH" target="_blank" rel="noopener noreferrer">GitHub Repository</a> |
          <a href="https://github.com/rodrigowf/QHCH/blob/main/QHCH.md" target="_blank" rel="noopener noreferrer">View Raw Content</a>
        </Links>
      </div>
      {isMobile && (
        <Tooltip
          title={isTocVisible ? "Show ToC" : "Hide ToC"}
          sx={{ position: 'absolute', left: 12 }}
        >
          <IconButton color="inherit" onClick={toggleTOCVisible}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        sx={{ position: isMobile ? 'fixed' : 'absolute', top: isMobile ? 18 : 'auto', right: 20 }}
      >
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </Header>
  );  
};

export default AppHeader; 