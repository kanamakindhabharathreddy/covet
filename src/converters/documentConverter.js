import mammoth from 'mammoth';
import { Document, Packer, Paragraph } from 'docx';
import { jsPDF } from 'jspdf';

const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read document as array buffer.'));
    reader.readAsArrayBuffer(file);
  });
};

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read document as text.'));
    reader.readAsText(file);
  });
};

export const convertDocument = async (file, targetFormat, onProgress) => {
  try {
    const inputExt = file.name.split('.').pop().toLowerCase();
    const format = targetFormat.toLowerCase();

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 0.1, message: 'Reading document...' });
    }

    let outputBlob = null;

    if (inputExt === 'docx') {
      if (format === 'txt') {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        if (onProgress) onProgress({ status: 'processing', ratio: 0.4, message: 'Extracting text...' });
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        outputBlob = new Blob([result.value], { type: 'text/plain' });
        
      } else if (format === 'html') {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        if (onProgress) onProgress({ status: 'processing', ratio: 0.4, message: 'Converting to HTML...' });
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        // Wrap output in boilerplate to ensure standalone browser readability
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1a1a1a; }
  </style>
</head>
<body>
  ${result.value}
</body>
</html>`;
        outputBlob = new Blob([htmlContent], { type: 'text/html' });
        
      } else if (format === 'pdf') {
        throw new Error('Use huggingface engine');
      } else {
        throw new Error('Unsupported target format from DOCX.');
      }
      
    } else if (inputExt === 'txt') {
      const text = await readFileAsText(file);
      
      if (format === 'docx') {
        if (onProgress) onProgress({ status: 'processing', ratio: 0.4, message: 'Building Word document...' });
        
        // Split by newlines and map to docx Paragraphs
        const paragraphs = text.split('\n').map(line => new Paragraph(line));
        const doc = new Document({
          sections: [{ children: paragraphs }]
        });
        
        if (onProgress) onProgress({ status: 'processing', ratio: 0.7, message: 'Packing DOCX...' });
        outputBlob = await Packer.toBlob(doc);
        
      } else if (format === 'pdf') {
        if (onProgress) onProgress({ status: 'processing', ratio: 0.4, message: 'Generating PDF...' });
        
        const doc = new jsPDF();
        // Break text strictly to fit A4 page width (approx 180 chars limit)
        const lines = doc.splitTextToSize(text, 180);
        let cursorY = 10;
        
        // Handle pagination manually
        lines.forEach(line => {
          if (cursorY > 280) {
            doc.addPage();
            cursorY = 10;
          }
          doc.text(line, 10, cursorY);
          cursorY += 7;
        });
        
        outputBlob = doc.output('blob');
        
      } else {
        throw new Error('Unsupported target format from TXT.');
      }
      
    } else if (inputExt === 'pdf') {
      if (format === 'docx') {
        throw new Error('Use huggingface engine');
      } else {
        throw new Error('Unsupported target format from PDF.');
      }
    } else {
      throw new Error(`Unsupported input document format: ${inputExt}`);
    }

    if (onProgress) {
      onProgress({ status: 'processing', ratio: 1, message: 'Done!' });
    }

    return outputBlob;
  } catch (error) {
    if (error.message === 'Use huggingface engine') {
      throw error;
    }
    console.error('Document Conversion Error:', error);
    throw new Error('Document conversion failed: ' + error.message);
  }
};
