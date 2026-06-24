import { formatMatrix } from '../config/formatMatrix';

export function getCategoryFromExtension(ext) {
  if (!ext) return 'unknown';
  for (const [category, formats] of Object.entries(formatMatrix)) {
    // Skip OCR process category to map purely to structural categories
    if (category === 'ocr') continue; 
    if (formats[ext]) {
      return category;
    }
  }
  return 'unknown';
}

export function detectFileType(file) {
  return new Promise((resolve) => {
    const fallback = () => {
      const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
      resolve({ extension: ext, category: getCategoryFromExtension(ext) });
    };

    if (!file || !file.slice) {
      return fallback();
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
      const buffer = e.target.result;
      const view = new Uint8Array(buffer);
      if (view.length < 4) return fallback();

      const checkSignature = (bytes) => {
        if (view.length < bytes.length) return false;
        for (let i = 0; i < bytes.length; i++) {
          if (view[i] !== bytes[i]) return false;
        }
        return true;
      };

      // PDF: %PDF (25 50 44 46)
      if (checkSignature([0x25, 0x50, 0x44, 0x46])) {
        return resolve({ extension: 'pdf', category: 'document' });
      }

      // PNG: 89 50 4E 47
      if (checkSignature([0x89, 0x50, 0x4E, 0x47])) {
        return resolve({ extension: 'png', category: 'image' });
      }

      // JPG: FF D8 FF
      if (checkSignature([0xFF, 0xD8, 0xFF])) {
        return resolve({ extension: 'jpg', category: 'image' });
      }

      // GIF: 47 49 46 38 (GIF8)
      if (checkSignature([0x47, 0x49, 0x46, 0x38])) {
        return resolve({ extension: 'gif', category: 'image' });
      }

      // WEBM: 1A 45 DF A3
      if (checkSignature([0x1A, 0x45, 0xDF, 0xA3])) {
        return resolve({ extension: 'webm', category: 'video' });
      }

      // WAV: 52 49 46 46 (RIFF)
      if (checkSignature([0x52, 0x49, 0x46, 0x46])) {
        return resolve({ extension: 'wav', category: 'audio' });
      }

      // MP3: ID3 or FF FB
      if (checkSignature([0x49, 0x44, 0x33]) || (view[0] === 0xFF && view[1] === 0xFB)) {
        return resolve({ extension: 'mp3', category: 'audio' });
      }

      // MP4: ftyp at offset 4
      if (view.length >= 8 && view[4] === 0x66 && view[5] === 0x74 && view[6] === 0x79 && view[7] === 0x70) {
        return resolve({ extension: 'mp4', category: 'video' });
      }

      // DOCX / XLSX: PK (50 4B) -> zip-based, check content types
      if (checkSignature([0x50, 0x4B])) {
        let text = '';
        for (let i = 0; i < Math.min(view.length, 4096); i++) {
          text += String.fromCharCode(view[i]);
        }
        
        // Check for content types characteristic of DOCX and XLSX
        if (text.includes('word/') || text.includes('wordprocessingml')) {
          return resolve({ extension: 'docx', category: 'document' });
        } else if (text.includes('xl/') || text.includes('spreadsheetml')) {
          return resolve({ extension: 'xlsx', category: 'spreadsheet' });
        } else {
          // If zip-based but can't definitively tell, fallback to file extension
          const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
          if (ext === 'docx') return resolve({ extension: 'docx', category: 'document' });
          if (ext === 'xlsx') return resolve({ extension: 'xlsx', category: 'spreadsheet' });
          return resolve({ extension: ext, category: getCategoryFromExtension(ext) });
        }
      }

      fallback();
    };

    reader.onerror = fallback;
    
    // Read the first 4KB to ensure we capture ZIP headers for DOCX/XLSX
    const blob = file.slice(0, 4096);
    reader.readAsArrayBuffer(blob);
  });
}
