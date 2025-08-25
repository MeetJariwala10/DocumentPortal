import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Container,
  useTheme,
  Fade,
  Chip
} from '@mui/material';
import LoadingButton from '../components/LoadingButton';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { analyzeDocument } from '../services/api';

const DocumentAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    } else {
      setFile(null);
      setFileName('');
      setError('Please select a valid PDF file');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await analyzeDocument(file);
      setResult(data);
    } catch (err) {
      console.error('Error analyzing document:', err);
      setError(err.response?.data?.detail || 'Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    const theme = useTheme();

    return (
      <Fade in={result !== null}>
        <Card 
          elevation={0}
          sx={{ 
            mt: 4, 
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <AnalyticsIcon />
            <Typography variant="h6">Analysis Results</Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            {Object.entries(result).map(([key, value], index) => (
              <Box key={key} sx={{ mb: index < Object.entries(result).length - 1 ? 3 : 0 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 1,
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Chip 
                    label={key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 1,
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                  }}
                >
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                </Paper>
                {index < Object.entries(result).length - 1 && (
                  <Divider sx={{ mt: 3 }} />
                )}
              </Box>
            ))}
          </CardContent>
        </Card>
      </Fade>
    );
  };

  const theme = useTheme();
  
  return (
    <Box className="fade-in">
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          textAlign: 'center',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 3,
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}
        >
          Document Analysis
        </Typography>
        <Divider sx={{ width: '60px', mx: 'auto', mb: 3, borderColor: theme.palette.primary.main, borderWidth: 2 }} />
        <Typography 
          variant="body1" 
          paragraph
          sx={{ 
            maxWidth: '700px', 
            mx: 'auto',
            color: theme.palette.text.secondary,
            lineHeight: 1.6
          }}
        >
          Upload a PDF document to extract structured metadata using LLM analysis.
        </Typography>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            py: 3
          }}
        >
          <Box 
            sx={{ 
              backgroundColor: `${theme.palette.primary.main}10`,
              borderRadius: '50%',
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3
            }}
          >
            <UploadFileIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontWeight: 600
            }}
          >
            Upload Your Document
          </Typography>
          
          <input
            accept="application/pdf"
            id="upload-pdf-file"
            type="file"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="upload-pdf-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadFileIcon />}
              sx={{ 
                py: 1.2,
                px: 3,
                borderWidth: '1px',
                '&:hover': {
                  borderWidth: '1px',
                  backgroundColor: theme.palette.primary.main,
                  color: '#fff'
                }
              }}
            >
              Select PDF File
            </Button>
          </label>
          
          {fileName && (
            <Fade in={!!fileName}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 2,
                  p: 1,
                  px: 2,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                Selected: <strong>{fileName}</strong>
              </Typography>
            </Fade>
          )}
          
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleAnalyze}
            disabled={!file || loading}
            loading={loading}
            loadingText="Analyze Document"
            sx={{ 
              mt: 4,
              py: 2,
              px: 6,
              borderRadius: 3,
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Analyze Document
          </LoadingButton>
        </Box>
      </Paper>

      {error && (
        <Fade in={!!error}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              borderRadius: 2
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>
      )}
      
      {renderResult()}
    </Box>
  );
};

export default DocumentAnalyzer;