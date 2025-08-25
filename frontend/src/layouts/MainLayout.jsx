import { Container, AppBar, Toolbar, Typography, Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import CompareIcon from '@mui/icons-material/Compare';
import ChatIcon from '@mui/icons-material/Chat';

const MainLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Document Analysis', icon: <DescriptionIcon />, path: '/analyze' },
    { text: 'Document Comparison', icon: <CompareIcon />, path: '/compare' },
    { text: 'Document Chat', icon: <ChatIcon />, path: '/chat' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // No sidebar/drawer – single top navigation only

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          background: 'linear-gradient(135deg, rgb(116, 136, 115) 0%, rgb(90, 110, 89) 100%)',
          color: 'white',
          borderBottom: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => navigate('/')}
          >
            <DescriptionIcon sx={{ mr: 1, fontSize: 28 }} />
            Document Portal
          </Typography>
          
          {/* Inline navigation on desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    fontWeight: isActive(item.path) ? 700 : 500,
                    backgroundColor: isActive(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    color: 'white',
                    border: isActive(item.path) ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      {/* No drawers – navigation only in AppBar */}
      
      {/* Main content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 4 }, 
          mt: '64px',
          ml: 0,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          minHeight: 'calc(100vh - 64px)',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
        className="content-stable"
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          bgcolor: 'background.paper', 
          mt: 'auto',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          ml: 0,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © Document Portal • {new Date().getFullYear()}
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Powered by FastAPI and React
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;