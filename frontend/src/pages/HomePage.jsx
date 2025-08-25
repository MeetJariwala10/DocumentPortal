import { Box, Typography, Button, Grid, Paper, Stack, useTheme } from '@mui/material';

const HomePage = () => {
  const theme = useTheme();
  
  return (
    <Box className="fade-in">
      {/* Hero Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 4, md: 8 }, 
          mb: 6, 
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgb(116, 136, 115) 0%, rgb(90, 110, 89) 100%)',
          borderRadius: 4,
          border: 'none',
          color: 'white',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              letterSpacing: '-0.02em'
            }}
          >
            Document Portal
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              maxWidth: '900px', 
              mx: 'auto',
              mb: 5,
              lineHeight: 1.6,
              fontWeight: 400,
              opacity: 0.95,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Transform your document workflow with AI-powered analysis, comparison, and intelligent chat capabilities
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => window.location.assign('/analyze')}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(0,0,0,0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => window.location.assign('/compare')}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.8)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderColor: 'white',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Compare PDFs
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* (Capabilities removed for a cleaner, focused landing) */}

      {/* CTA Section */}
      <Paper 
        elevation={0}
        sx={{
          mt: 6,
          p: { xs: 4, md: 6 },
          borderRadius: 3,
          border: 'none',
          background: 'linear-gradient(135deg, rgb(244, 194, 142) 0%, rgb(238, 178, 126) 100%)',
          color: 'white',
          boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Ready to streamline your document workflow?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                Start by analyzing a single PDF or upload multiple files to build a searchable index.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button 
                  variant="contained" 
                  onClick={() => window.location.assign('/analyze')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: 'white',
                    color: 'rgb(116, 136, 115)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Analyze PDF
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.assign('/chat')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    borderWidth: 2,
                    borderColor: 'rgba(255,255,255,0.8)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'white',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Build Index
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;