import React from 'react';
import { Button, CircularProgress } from '@mui/material';

/**
 * A reusable button component that shows a loading spinner when in loading state
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {string} props.loadingText - Text to be shown (but hidden) during loading
 * @param {React.ReactNode} props.startIcon - Optional icon to show at the start of the button
 * @param {Object} props.sx - Additional styles to apply to the button
 */
const LoadingButton = ({ 
  loading, 
  loadingText, 
  children, 
  startIcon, 
  sx = {}, 
  ...props 
}) => {
  return (
    <Button
      {...props}
      startIcon={!loading && startIcon}
      sx={{ 
        position: 'relative',
        height: '48px', // Fixed height to prevent shifting
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '180px',
        ...sx
      }}
    >
      {loading ? (
        <>
          <CircularProgress 
            size={24} 
            sx={{ 
              color: 'white',
              position: 'absolute'
            }} 
          />
          <span style={{ opacity: 0 }}>{loadingText || children}</span>
        </>
      ) : children}
    </Button>
  );
};

export default LoadingButton;