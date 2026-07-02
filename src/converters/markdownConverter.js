import { marked } from 'marked';
import DOMPurify from 'dompurify';
import jsPDF from 'jspdf';

export const convertMarkdown = async (file, format, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        onProgress?.({ status: 'processing', ratio: 0.2, message: 'Parsing markdown...' });
        
        const markdownText = e.target.result;
        // Convert to HTML
        const rawHtml = await marked.parse(markdownText);
        // Sanitize
        const cleanHtml = DOMPurify.sanitize(rawHtml);

        if (format === 'html') {
          onProgress?.({ status: 'processing', ratio: 1.0, message: 'Done' });
          const blob = new Blob([cleanHtml], { type: 'text/html' });
          resolve(blob);
          return;
        }

        if (format === 'pdf') {
          onProgress?.({ status: 'processing', ratio: 0.5, message: 'Rendering PDF...' });
          
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4'
          });
          
          const container = document.createElement('div');
          container.style.width = '550px';
          container.style.padding = '20px';
          container.style.fontFamily = 'sans-serif';
          container.style.fontSize = '12px';
          container.style.lineHeight = '1.5';
          container.style.position = 'absolute';
          container.style.top = '0';
          container.style.left = '0';
          container.style.zIndex = '-9999';
          container.style.backgroundColor = '#ffffff';
          container.style.color = '#000000';
          container.innerHTML = cleanHtml;
          document.body.appendChild(container);

          await doc.html(container, {
            callback: function (doc) {
              document.body.removeChild(container);
              onProgress?.({ status: 'processing', ratio: 1.0, message: 'Done' });
              resolve(doc.output('blob'));
            },
            x: 20,
            y: 20,
            width: 550,
            windowWidth: 600
          });
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read markdown file.'));
      reader.readAsText(file);
    } catch (err) {
      reject(err);
    }
  });
};
