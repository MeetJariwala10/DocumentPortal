import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
  Slider,
  FormControlLabel,
  Switch,
  InputAdornment,
  useTheme,
  Fade,
  Chip,
  Stack,
  Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import { buildChatIndex, queryChatDocument } from '../services/api';
import LoadingButton from '../components/LoadingButton';

const DocumentChat = () => {
  // File and session state
  const [files, setFiles] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [useSessionDirs, setUseSessionDirs] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  
  // Configuration state
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [k, setK] = useState(5);
  
  // UI state
  const [indexingLoading, setIndexingLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'text/plain'
    );
    
    if (validFiles.length !== selectedFiles.length) {
      setError('Some files were skipped. Only PDF, DOCX, and TXT files are supported.');
    } else {
      setError('');
    }
    
    setFiles(validFiles);
  };

  const handleBuildIndex = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIndexingLoading(true);
    setError('');
    setIndexingStatus('Building index...');
    
    try {
      const data = await buildChatIndex(
        files, 
        sessionId.trim() || null, 
        useSessionDirs, 
        chunkSize, 
        chunkOverlap, 
        k
      );
      
      setCurrentSession(data.session_id);
      setIndexingStatus(`Indexed successfully. Session ID: ${data.session_id || '(none)'}, k=${data.k}`);
    } catch (err) {
      console.error('Error building index:', err);
      setError(err.response?.data?.detail || 'Failed to build index. Please try again.');
      setIndexingStatus('');
    } finally {
      setIndexingLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }
    
    if (useSessionDirs && !currentSession) {
      setError('Please build the index first (session-based mode is ON)');
      return;
    }

    setQueryLoading(true);
    setError('');
    setAnswer('Thinking...');
    
    try {
      const data = await queryChatDocument(
        question.trim(),
        currentSession,
        useSessionDirs,
        k
      );
      
      setAnswer(data.answer || 'No answer found.');
    } catch (err) {
      console.error('Error querying document:', err);
      setError(err.response?.data?.detail || 'Failed to process question. Please try again.');
      setAnswer('');
    } finally {
      setQueryLoading(false);
    }
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
          Document Chat
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
          Chat with your documents using RAG (Retrieval-Augmented Generation).
        </Typography>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 4, 
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          gap: 2,
          p: 2,
          backgroundColor: `${theme.palette.primary.main}08`,
          borderRadius: 2,
          border: `1px solid ${theme.palette.primary.main}20`
        }}>
          <Box sx={{ 
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TuneIcon sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.primary.main
            }}
          >
            Step 1: Build Index
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {/* Left Column - File Upload & Settings */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={3}>
              {/* File Upload Area */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  border: '2px dashed rgba(0, 0, 0, 0.15)',
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    backgroundColor: `${theme.palette.primary.main}15`,
                    borderRadius: '50%',
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    mx: 'auto'
                  }}
                >
                  <UploadFileIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Upload Documents
                </Typography>
                
                <input
                  accept=".pdf,.docx,.txt"
                  id="upload-chat-files"
                  type="file"
                  multiple
                  onChange={handleFilesChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="upload-chat-files">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFileIcon />}
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Select Documents
                  </Button>
                </label>
                
                {files.length > 0 && (
                  <Fade in={files.length > 0}>
                    <Box sx={{ mt: 3 }}>
                      <Chip 
                        label={`${files.length} file(s) selected`}
                        color="primary"
                        variant="filled"
                        sx={{ mb: 2, fontWeight: 600 }}
                      />
                      <Paper 
                        elevation={0}
                        sx={{ 
                          maxHeight: '120px', 
                          overflowY: 'auto',
                          p: 2,
                          backgroundColor: theme.palette.background.default,
                          borderRadius: 2,
                          border: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        {files.map((f, i) => (
                          <Box 
                            key={i} 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mb: 1,
                              p: 1,
                              backgroundColor: 'white',
                              borderRadius: 1,
                              border: '1px solid rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <UploadFileIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                            >
                              {f.name}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    </Box>
                  </Fade>
                )}
              </Paper>
              
              {/* Session Settings */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 2,
                  backgroundColor: 'white'
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.text.primary }}>
                  Session Settings
                </Typography>
                
                <TextField
                  label="Session ID (optional)"
                  variant="outlined"
                  fullWidth
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  margin="normal"
                  helperText="Leave empty to generate automatically"
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={useSessionDirs}
                      onChange={(e) => setUseSessionDirs(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Use session-based directories
                    </Typography>
                  }
                />
              </Paper>
            </Stack>
          </Grid>
          
          {/* Right Column - Advanced Configuration */}
          <Grid item xs={12} lg={6}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                height: '100%',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: 3,
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3, 
                gap: 1.5,
                p: 2,
                backgroundColor: `${theme.palette.primary.main}08`,
                borderRadius: 2
              }}>
                <SettingsIcon fontSize="medium" color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  Advanced Configuration
                </Typography>
              </Box>
              
              <Stack spacing={3}>
                <Tooltip title="Controls how documents are split into chunks for processing">
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Chunk Size
                      </Typography>
                      <Chip 
                        label={chunkSize} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Slider
                      value={chunkSize}
                      onChange={(_, newValue) => setChunkSize(newValue)}
                      min={100}
                      max={2000}
                      step={100}
                      marks
                      valueLabelDisplay="auto"
                      color="primary"
                      sx={{ 
                        '& .MuiSlider-mark': {
                          backgroundColor: theme.palette.primary.main
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
                
                <Tooltip title="Determines how much chunks overlap to maintain context">
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Chunk Overlap
                      </Typography>
                      <Chip 
                        label={chunkOverlap} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Slider
                      value={chunkOverlap}
                      onChange={(_, newValue) => setChunkOverlap(newValue)}
                      min={0}
                      max={500}
                      step={50}
                      marks
                      valueLabelDisplay="auto"
                      color="primary"
                      sx={{ 
                        '& .MuiSlider-mark': {
                          backgroundColor: theme.palette.primary.main
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
                
                <Tooltip title="Number of most relevant chunks to retrieve when answering questions">
                  <Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        K (chunks to retrieve)
                      </Typography>
                      <Chip 
                        label={k} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    <Slider
                      value={k}
                      onChange={(_, newValue) => setK(newValue)}
                      min={1}
                      max={20}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      color="primary"
                      sx={{ 
                        '& .MuiSlider-mark': {
                          backgroundColor: theme.palette.primary.main
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
              </Stack>
            </Paper>
          </Grid>
          
          {/* Action Button Row */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 2,
              p: 3,
              backgroundColor: `${theme.palette.primary.main}05`,
              borderRadius: 3,
              border: `1px solid ${theme.palette.primary.main}15`
            }}>
              <LoadingButton
                variant="contained"
                color="primary"
                onClick={handleBuildIndex}
                disabled={files.length === 0 || indexingLoading}
                loading={indexingLoading}
                loadingText="Building Index..."
                startIcon={!indexingLoading && <TuneIcon />}
                sx={{ 
                  py: 2,
                  px: 6,
                  borderRadius: 3,
                  minWidth: '280px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {indexingLoading ? 'Building Index...' : 'Build / Update Index'}
              </LoadingButton>
            </Box>
            
            {indexingStatus && (
              <Fade in={!!indexingStatus}>
                <Alert 
                  severity="success" 
                  variant="filled"
                  sx={{ 
                    mt: 3,
                    borderRadius: 2,
                    justifyContent: 'center',
                    fontWeight: 500
                  }}
                >
                  {indexingStatus}
                </Alert>
              </Fade>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4, 
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          gap: 1
        }}>
          <ChatIcon color="primary" />
          <Typography 
            variant="h6" 
            sx={{ fontWeight: 600 }}
          >
            Step 2: Ask Questions
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <TextField
          label="Your Question"
          variant="outlined"
          fullWidth
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          margin="normal"
          disabled={queryLoading}
          placeholder="What would you like to know about your documents?"
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: 1
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAskQuestion}
                    disabled={!question.trim() || queryLoading || (useSessionDirs && !currentSession)}
                    endIcon={!queryLoading && <SendIcon />}
                    sx={{ 
                      borderRadius: 3,
                      position: 'relative',
                      minWidth: '120px',
                      py: 1.5,
                      px: 3,
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
                    {queryLoading ? (
                      <>
                        <CircularProgress 
                          size={20} 
                          sx={{ 
                            color: 'white',
                            position: 'absolute',
                            left: 'calc(50% - 10px)'
                          }} 
                        />
                        <span style={{ visibility: 'hidden' }}>Ask</span>
                      </>
                    ) : 'Ask'}
                  </Button>
              </InputAdornment>
            ),
          }}
        />
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
      
      {answer && (
        <Fade in={!!answer}>
          <Card 
            elevation={0}
            sx={{ 
              mt: 3, 
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
              <ChatIcon />
              <Typography variant="h6">Answer</Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="body1"
                sx={{ 
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {answer}
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      )}
    </Box>
  );
};

export default DocumentChat;