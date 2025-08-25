import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  const theme = useTheme();
  
  return (
    <Box className="fade-in" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 5, 
          textAlign: 'center',
          maxWidth: 600,
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 80, color: theme.palette.error.main, mb: 2, opacity: 0.8 }} />
        
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4, color: theme.palette.text.secondary }}>
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        
        <Button 
          component={Link} 
          to="/"
          variant="contained" 
          color="primary"
          startIcon={<HomeIcon />}
          sx={{ 
            py: 1.2,
            px: 3
          }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;