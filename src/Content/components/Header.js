import React from 'react';
import { Header, Title, Subtitle, Links } from './styled.components';
import { Tooltip, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const AppHeader = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <Header id="main-header">
      <div className="header-content">
        <Title>Quantum Holographic Consciousness Hypothesis</Title>
        <Subtitle>A Unified Framework for Consciousness and Reality</Subtitle>
        <Links>
          <a href="https://github.com/rodrigowf/QHPH" target="_blank" rel="noopener noreferrer">GitHub Repository</a> |
          <a href="https://github.com/rodrigowf/QHPH/blob/main/QHPH.md" target="_blank" rel="noopener noreferrer">View Raw Content</a>
        </Links>
      </div>
      <Tooltip
        title={isDarkMode ? "Show ToC" : "Hide ToC"}
        sx={{ position: 'absolute', right: 26 }}
      >
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
      <Tooltip
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        sx={{ position: 'absolute', right: 26 }}
      >
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </Header>
  );  
};

export default AppHeader; 