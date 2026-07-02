import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMatrix } from '../config/formatMatrix';

// Helper to render nicer engine names
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

  // Safely lookup the allowed target formats for the detected category and extension
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

  // If no formats map to this extension, handle edge case gracefully
  if (formats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-6 bg-white/5 rounded-xl border border-white/10 text-gray-400 mt-6 max-w-2xl mx-auto"
      >
        No conversion formats available for <span className="uppercase font-semibold text-white">{fileType}</span>.
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 w-full max-w-3xl mx-auto"
    >
      <h3 className="text-lg font-medium text-white mb-6 text-center">Select Output Format</h3>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {formats.map((format) => {
          const isSelected = selectedFormat?.ext === format.ext;
          const isUnlock = format.ext === 'unlock';

          if (isUnlock) {
            return (
              <motion.button
                key={format.ext}
                onClick={() => handleSelect(format)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative flex flex-col items-center justify-center w-28 h-28 rounded-2xl transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'border-white/10 bg-white/5 hover:border-amber-500/50 hover:bg-amber-500/10'
                }`}
              >
                <div className={`mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className={`text-sm font-bold tracking-wider mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  Unlock PDF
                </span>
                <span className={`text-[10px] font-semibold tracking-wide ${isSelected ? 'text-amber-500' : 'text-gray-500'}`}>
                  via LibreOffice
                </span>
              </motion.button>
            );
          }

          return (
            <motion.button
              key={format.ext}
              onClick={() => handleSelect(format)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center w-28 h-28 rounded-2xl transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-accent bg-accent/20 shadow-[0_0_20px_rgba(124,58,237,0.3)]'
                  : 'border-white/10 bg-white/5 hover:border-accent/50 hover:bg-accent/10'
              }`}
            >
              <span className={`text-2xl font-bold uppercase tracking-wider mb-2 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                {format.ext}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide ${isSelected ? 'text-[#a78bfa]' : 'text-gray-500'}`}>
                via {formatEngineName(format.engine)}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedFormat && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex justify-center overflow-hidden"
          >
            <motion.button
              onClick={() => onConvert && onConvert(selectedFormat.ext, selectedFormat.engine)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-10 py-4 mt-2 rounded-full bg-accent text-white font-semibold text-lg shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all"
            >
              Convert
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
