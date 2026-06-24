export const convertImage = async (file, targetFormat, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const format = targetFormat.toLowerCase();
      
      // Fire initial progress event to show activity in the UI (10%)
      if (onProgress) {
        onProgress({ status: 'processing', ratio: 0.1, message: 'Loading image...' });
      }

      // Handle GIF edge case immediately
      if (format === 'gif') {
        const inputExt = file.name.split('.').pop().toLowerCase();
        if (inputExt === 'gif') {
          // Return original file since it's already an animated GIF
          if (onProgress) onProgress({ status: 'processing', ratio: 1, message: 'Done!' });
          return resolve(file); 
        }
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image into browser memory.'));
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        
        // Fill white background for formats that don't support transparency
        if (format === 'jpg' || format === 'jpeg' || format === 'bmp') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);

        // Update progress after drawing to canvas (60%)
        if (onProgress) {
          onProgress({ status: 'processing', ratio: 0.6, message: 'Encoding image...' });
        }

        const finalizeBlob = (blob, forcedType) => {
          URL.revokeObjectURL(url);
          
          if (!blob) {
            return reject(new Error('Canvas returned a null blob.'));
          }

          // If a forcedType is provided (like BMP/GIF fallback), wrap the blob
          const finalBlob = forcedType ? new Blob([blob], { type: forcedType }) : blob;

          if (onProgress) {
            onProgress({ status: 'processing', ratio: 1, message: 'Done!' });
          }

          resolve(finalBlob);
        };

        // Export according to target format
        if (format === 'jpg' || format === 'jpeg') {
          canvas.toBlob((blob) => finalizeBlob(blob), 'image/jpeg', 0.92);
        } else if (format === 'webp') {
          canvas.toBlob((blob) => finalizeBlob(blob), 'image/webp', 0.90);
        } else if (format === 'png') {
          canvas.toBlob((blob) => finalizeBlob(blob), 'image/png');
        } else if (format === 'bmp') {
          // Fallback: canvas to PNG, wrapped as BMP MIME
          canvas.toBlob((blob) => finalizeBlob(blob, 'image/bmp'), 'image/png');
        } else if (format === 'gif') {
          // Target is GIF but input wasn't. Fallback: canvas to PNG, wrapped as GIF MIME
          canvas.toBlob((blob) => finalizeBlob(blob, 'image/gif'), 'image/png');
        } else {
          canvas.toBlob((blob) => finalizeBlob(blob), 'image/png');
        }
      };

      img.src = url;
    } catch (error) {
      reject(new Error('Image conversion failed: ' + error.message));
    }
  });
};
