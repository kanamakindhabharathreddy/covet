import axios from 'axios';

export const convertViaHuggingFace = async (file, targetFormat, onProgress) => {
  try {
    const HF_URL = import.meta.env.VITE_HF_SPACE_URL || 'https://bharath491-covet-converter.hf.space';
    if (!HF_URL) {
      throw new Error('HuggingFace Space URL is not configured in .env variables.');
    }

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.1, message: 'Sending to LibreOffice...' });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target', targetFormat); // or targetFormat depending on API, assuming targetFormat as a generic parameter

    const response = await axios.post(`${HF_URL}/convert`, formData, {
      responseType: 'blob',
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          // Map 0 -> 1 upload progress to 0.1 -> 0.6 overall progress
          const uploadRatio = progressEvent.loaded / progressEvent.total;
          const mappedRatio = 0.1 + (uploadRatio * 0.5); 
          onProgress({ 
            status: 'processing', 
            ratio: mappedRatio, 
            message: 'Sending to LibreOffice...' 
          });
        }
      }
    });

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.8, message: 'Receiving converted file...' });
    }

    const format = targetFormat.toLowerCase();
    const mimeType = format === 'pdf' 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const outputBlob = new Blob([response.data], { type: mimeType });

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 1, message: 'Done!' });
    }

    return outputBlob;
  } catch (error) {
    console.error('HuggingFace Conversion Error:', error);
    
    // Extract the real error from the API response if available
    let errorMessage = 'LibreOffice conversion failed. Space may be waking up, try again in 30s.';
    
    if (error.response && error.response.data) {
        if (error.response.data instanceof Blob) {
            try {
                const text = await error.response.data.text();
                const json = JSON.parse(text);
                errorMessage = json.detail || text;
            } catch (e) {
                errorMessage = 'Backend API Error: ' + error.message;
            }
        } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
        }
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};
