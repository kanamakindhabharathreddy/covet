import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMatrix } from '../config/formatMatrix';

const formatEngineName = (engine) => {
  const map = {
    ffmpeg: 'FFmpeg',
    canvas: 'Browser',
    mammoth: 'Mammoth.js',
    huggingface: 'HuggingFace',
    data: 'Data Parser',
    sheetjs: 'SheetJS',
    docx: 'DOCX Engine',
    tesseract: 'Tesseract',
  };
  return map[engine.toLowerCase()] || engine;
};

export default function FormatSelector({ fileType, category, onFormatSelect, onConvert }) {
  const [selectedFormat, setSelectedFormat] = useState(null);

  const allowedFormatsMap = formatMatrix[category]?.[fileType] || {};
  const formats = Object.entries(allowedFormatsMap).map(([ext, engine]) => ({
    ext,
    engine,
  }));

  const handleSelect = (format) => {
    setSelectedFormat(format);
    if (onFormatSelect) {
      onFormatSelect(format.ext, format.engine);
    }
  };

  if (formats.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 24,
        background: '#0f0f0f',
        borderRadius: 10,
        border: '1px solid #1e1e1e',
        color: '#52525b',
        marginTop: 24,
        maxWidth: '42rem',
        margin: '24px auto 0',
      }}>
        No conversion formats available for <span style={{ textTransform: 'uppercase', fontWeight: 600, color: '#fffbf5' }}>{fileType}</span>.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 32, width: '100%', maxWidth: '48rem', margin: '32px auto 0' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
        {formats.map((format) => {
          const isSelected = selectedFormat?.ext === format.ext;
          const isUnlock = format.ext === 'unlock';

          return (
            <div key={format.ext} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => handleSelect(format)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 7,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  background: isSelected
                    ? (isUnlock ? 'rgba(212,168,67,0.08)' : 'rgba(212,168,67,0.1)')
                    : '#141414',
                  border: isSelected
                    ? (isUnlock ? '1px solid rgba(212,168,67,0.4)' : '1px solid rgba(212,168,67,0.3)')
                    : '1px solid #1e1e1e',
                  color: isSelected
                    ? '#d4a843'
                    : '#52525b',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)';
                    e.currentTarget.style.color = '#fffbf5';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#1e1e1e';
                    e.currentTarget.style.color = '#52525b';
                  }
                }}
              >
                {isUnlock ? '🔓 UNLOCK' : format.ext.toUpperCase()}
              </button>
              {isSelected && (
                <span style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  via {formatEngineName(format.engine)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedFormat && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden' }}
          >
            <motion.button
              onClick={() => onConvert && onConvert(selectedFormat.ext, selectedFormat.engine)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 28px',
                marginTop: 8,
                borderRadius: 8,
                background: '#d4a843',
                color: '#050505',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {selectedFormat.ext === 'unlock' ? (
                <>
                  <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                  Unlock PDF
                </>
              ) : (
                <>
                  Convert
                  <svg style={{ width: 16, height: 16 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </motion.button>
            
            <div style={{ 
              marginTop: 20, 
              textAlign: 'center', 
              fontSize: 10, 
              color: '#52525b', 
              fontFamily: 'monospace', 
              letterSpacing: '0.04em', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 6 
            }}>
              {selectedFormat.engine.toLowerCase().includes('huggingface') ? (
                <>
                  <svg style={{ width: 12, height: 12, color: '#a07c2e' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span>STATELESS CLOUD &bull; DELETED AFTER CONVERSION</span>
                </>
              ) : (
                <>
                  <svg style={{ width: 12, height: 12, color: '#d4a843' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>100% LOCAL &bull; NO DATA LEAVES DEVICE</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
