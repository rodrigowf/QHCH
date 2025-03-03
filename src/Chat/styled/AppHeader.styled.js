import { styled, AppBar, Box, FormControl } from '@mui/material';

export const StyledAppBar = styled(AppBar)`
  background: linear-gradient(-55deg, 
    rgb(37, 69, 102) 0%, 
    rgb(68, 107, 139) 25%,
    rgb(85, 138, 174) 50%,
    rgb(58, 91, 118) 75%,
    #143556 100%
  );

  &.animate {
    background-size: 300% 300%;
    animation: gradient 25s linear infinite;
  }

  &.dark-mode {
    background: linear-gradient(-55deg, 
      #262B30 0%, 
      #364A62 25%,
      #36567B 50%,
      #2A3645 75%,
      #1E2328 100%
    );
    &.animate {
      background-size: 300% 300%;
      animation: gradient 25s linear infinite;
    }
  }

  @keyframes gradient {
    0% {
      background-position: 300% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export const ControlsContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${props => props.isMobile ? '0.3rem' : '1rem'};
`;

export const StyledFormControl = styled(FormControl)(({ theme, isDarkMode, isMobile }) => ({
  marginTop: isMobile ? 20 : 0,
  marginBottom: isMobile ? theme.spacing(2) : 0,
  marginLeft: isMobile ? theme.spacing(2) : 0,
  minWidth: 190,
  '& .MuiOutlinedInput-root': {
    backgroundColor: isDarkMode ? '#2d2d2d' : theme.palette.background.paper,
    borderRadius: 4,
    ...(isMobile ? {} : {
      '& fieldset': { borderColor: 'transparent' },
      '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' }
    })
    
  },
  '& .MuiSelect-select, & .MuiInputLabel-root': {
    color: isDarkMode ? '#fff' : theme.palette.text.primary,
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -6px) scale(0.75)',
    background: isDarkMode ? '#2d2d2d' : '#efefef',
    borderRadius: '3px',
    padding: '0 4px'
  }
})); 