import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

/**
 * A reusable file upload button component
 * 
 * @param {Object} props - Component props
 * @param {string} props.id - Input ID for the file upload
 * @param {string} props.accept - Accepted file types (e.g., '.pdf,.txt')
 * @param {Function} props.onChange - Function to handle file change
 * @param {boolean} props.multiple - Whether multiple files can be selected
 * @param {string} props.buttonText - Text to display on the button
 * @param {Array|Object} props.selectedFiles - Selected file(s)
 * @param {Function} props.renderFileList - Custom renderer for the file list
 * @returns {JSX.Element} - The FileUploadButton component
 */
const FileUploadButton = ({
  id,
  accept,
  onChange,
  multiple = false,
  buttonText = 'Select File',
  selectedFiles,
  renderFileList,
}) => {
  // Default file list renderer
  const defaultRenderFileList = () => {
    if (!selectedFiles) return null;
    
    if (multiple && Array.isArray(selectedFiles)) {
      return (
        <Box sx={{ mt: 2 }}>
          {selectedFiles.map((file, index) => (
            <Typography key={index} variant="body2" sx={{ mt: 1 }}>
              {file.name}
            </Typography>
          ))}
        </Box>
      );
    } else if (!multiple && selectedFiles) {
      return (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {selectedFiles.name}
        </Typography>
      );
    }
    
    return null;
  };

  return (
    <Box>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id={id}
        type="file"
        onChange={onChange}
        multiple={multiple}
      />
      <label htmlFor={id}>
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadFileIcon />}
          sx={{ 
            minWidth: '180px',
            py: 1,
            borderColor: 'rgba(0, 0, 0, 0.23)',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          {buttonText}
        </Button>
      </label>
      
      {renderFileList ? renderFileList(selectedFiles) : defaultRenderFileList()}
    </Box>
  );
};

export default FileUploadButton;