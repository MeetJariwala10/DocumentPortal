import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  useTheme,
  Fade,
  Card,
  CardContent
} from '@mui/material';
import LoadingButton from '../components/LoadingButton';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DifferenceIcon from '@mui/icons-material/Difference';
import { compareDocuments } from '../services/api';

const DocumentCompare = () => {
  const [referenceFile, setReferenceFile] = useState(null);
  const [actualFile, setActualFile] = useState(null);
  const [referenceFileName, setReferenceFileName] = useState('');
  const [actualFileName, setActualFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleReferenceFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setReferenceFile(selectedFile);
      setReferenceFileName(selectedFile.name);
      setError('');
    } else {
      setReferenceFile(null);
      setReferenceFileName('');
      setError('Please select a valid PDF file');
    }
  };

  const handleActualFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setActualFile(selectedFile);
      setActualFileName(selectedFile.name);
      setError('');
    } else {
      setActualFile(null);
      setActualFileName('');
      setError('Please select a valid PDF file');
    }
  };

  const handleCompare = async () => {
    if (!referenceFile || !actualFile) {
      setError('Please select both reference and actual PDF files');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await compareDocuments(referenceFile, actualFile);
      setResult(data);
    } catch (err) {
      console.error('Error comparing documents:', err);
      setError(err.response?.data?.detail || 'Failed to compare documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    const theme = useTheme();
    
    if (!result) return null;
    
    if (!result.rows || result.rows.length === 0) {
      return (
        <Fade in={true}>
          <Alert 
            severity="info" 
            sx={{ 
              mt: 4,
              borderRadius: 2,
              p: 2
            }}
          >
            No differences found between the documents.
          </Alert>
        </Fade>
      );
    }

    return (
      <Fade in={true}>
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
            <DifferenceIcon />
            <Typography variant="h6">Comparison Results</Typography>
          </Box>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: theme.palette.background.paper,
                        width: '15%'
                      }}
                    >
                      Page
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 600,
                        backgroundColor: theme.palette.background.paper
                      }}
                    >
                      Changes
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.rows.map((row, index) => (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': {
                          backgroundColor: theme.palette.background.default,
                        },
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}08`,
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{row.page || row.Page || ''}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{row.changes || row.Changes || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.05)'
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
          Document Comparison
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
          Compare two PDF documents to identify differences with LLM-powered analysis.
        </Typography>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                p: 3,
                borderRadius: 3,
                border: '2px dashed rgba(116, 136, 115, 0.3)',
                backgroundColor: 'white',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgb(116, 136, 115)',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  backgroundColor: `${theme.palette.primary.main}10`,
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mt: 2
                }}
              >
                <UploadFileIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Reference Document
              </Typography>
              
              <input
                accept="application/pdf"
                id="upload-reference-file"
                type="file"
                onChange={handleReferenceFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="upload-reference-file">
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
                  Select Reference PDF
                </Button>
              </label>
              
              {referenceFileName && (
                <Fade in={!!referenceFileName}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2,
                      p: 1,
                      px: 2,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <strong>{referenceFileName}</strong>
                  </Typography>
                </Fade>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%',
                p: 3,
                borderRadius: 3,
                border: '2px dashed rgba(116, 136, 115, 0.3)',
                backgroundColor: 'white',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'rgb(116, 136, 115)',
                  boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  backgroundColor: `${theme.palette.primary.main}10`,
                  borderRadius: '50%',
                  width: 80,
                  height: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  mt: 2
                }}
              >
                <UploadFileIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
              
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  mb: 2
                }}
              >
                Actual Document
              </Typography>
              
              <input
                accept="application/pdf"
                id="upload-actual-file"
                type="file"
                onChange={handleActualFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="upload-actual-file">
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
                  Select Actual PDF
                </Button>
              </label>
              
              {actualFileName && (
                <Fade in={!!actualFileName}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2,
                      p: 1,
                      px: 2,
                      backgroundColor: 'white',
                      borderRadius: 1,
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <strong>{actualFileName}</strong>
                  </Typography>
                </Fade>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                mt: 6,
                mb: 3,
                p: 3,
                backgroundColor: 'rgba(116, 136, 115, 0.05)',
                borderRadius: 3,
                border: '1px solid rgba(116, 136, 115, 0.1)'
              }}
            >
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={handleCompare}
                disabled={!referenceFile || !actualFile || loading}
                loading={loading}
                loadingText="Compare Documents"
                startIcon={<CompareArrowsIcon />}
                sx={{ 
                  py: 3,
                  px: 8,
                  borderRadius: 4,
                  minWidth: '320px',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.35)'
                  },
                  '&:disabled': {
                    opacity: 0.6,
                    transform: 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Compare Documents
              </LoadingButton>
            </Box>
          </Grid>
        </Grid>
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

export default DocumentCompare;