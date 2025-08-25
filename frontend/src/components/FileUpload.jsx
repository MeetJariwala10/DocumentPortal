import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Fade, 
  useTheme 
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

/**
 * A reusable file upload component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.accept - File types to accept (e.g., '.pdf,.docx')
 * @param {string} props.id - Unique ID for the file input
 * @param {Function} props.onChange - Function to call when files change
 * @param {boolean} props.multiple - Whether to allow multiple file selection
 * @param {string} props.buttonText - Text to display on the button
 * @param {Array} props.files - Array of selected files
 * @param {Function} props.renderFileList - Custom function to render file list
 */
const FileUpload = ({ 
  accept, 
  id, 
  onChange, 
  multiple = false, 
  buttonText = 'Select Files',
  files = [],
  renderFileList,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        mb: 3,
        p: 3,
        border: '1px dashed rgba(0, 0, 0, 0.12)',
        borderRadius: 2,
        backgroundColor: theme.palette.background.default,
        textAlign: 'center',
        ...props.sx
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
          mx: 'auto'
        }}
      >
        <UploadFileIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
      </Box>
      
      <input
        accept={accept}
        id={id}
        type="file"
        multiple={multiple}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      <label htmlFor={id}>
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
          {buttonText}
        </Button>
      </label>
      
      {files.length > 0 && renderFileList && renderFileList(files)}
      
      {files.length > 0 && !renderFileList && (
        <Fade in={files.length > 0}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {files.length} file(s) selected
            </Typography>
            <Box 
              sx={{ 
                maxHeight: '80px', 
                overflowY: 'auto',
                p: 1,
                backgroundColor: 'white',
                borderRadius: 1,
                border: '1px solid rgba(0, 0, 0, 0.05)',
                fontSize: '0.875rem',
                mt: 1
              }}
            >
              {files.map((file, i) => (
                <Typography 
                  key={i} 
                  variant="body2" 
                  sx={{ 
                    mb: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}
                >
                  {file.name}
                </Typography>
              ))}
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default FileUpload;