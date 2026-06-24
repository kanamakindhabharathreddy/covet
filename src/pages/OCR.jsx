import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';
import UploadZone from '../components/UploadZone';
import ProgressBar from '../components/ProgressBar';

export default function OCR() {
  const [appState, setAppState] = useState('IDLE'); // IDLE -> PROCESSING -> DONE
  const [file, setFile] = useState(null);
  const [progressData, setProgressData] = useState({ progress: 0, label: 'Initializing...' });
  const [extractedText, setExtractedText] = useState('');
  const [language, setLanguage] = useState('eng');
  const [errorMsg, setErrorMsg] = useState(null);

  const languages = [
    { code: 'eng', label: 'English' },
    { code: 'hin', label: 'Hindi' },
    { code: 'tel', label: 'Telugu' }
  ];

  const handleFileReady = async (uploadedFile, detectedType) => {
    if (detectedType.category !== 'image' && detectedType.extension !== 'pdf') {
      setErrorMsg('Please upload a valid image (JPG, PNG, WEBP, BMP, TIFF) or PDF file for OCR.');
      return;
    }
    
    setErrorMsg(null);
    setFile(uploadedFile);
    setAppState('PROCESSING');
    setProgressData({ progress: 0, label: 'Initializing Tesseract.js...' });
    
    try {
      const result = await Tesseract.recognize(uploadedFile, language, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgressData({
              progress: Math.round(m.progress * 100),
              label: 'Recognizing text...'
            });
          } else {
            setProgressData({
              progress: 0,
              label: m.status.charAt(0).toUpperCase() + m.status.slice(1) + '...'
            });
          }
        }
      });
      
      setExtractedText(result.data.text);
      setAppState('DONE');
    } catch (err) {
      console.error(err);
      setErrorMsg('OCR extraction failed. Tesseract natively supports images, but complex PDFs may require manual image extraction first.');
      setAppState('IDLE');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
  };

  const handleDownload = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${file?.name || 'text'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

      <div className="w-full max-w-4xl relative z-10 flex flex-col h-full py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Extract Text <span className="text-accent">Instantly</span></h1>
          <p className="text-gray-400 text-lg">Powerful local OCR using Tesseract.js</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2 px-4 backdrop-blur-sm">
            <span className="text-sm font-medium text-gray-400">Language:</span>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={appState === 'PROCESSING'}
              className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code} className="bg-background text-white">{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {appState === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <UploadZone onFileReady={handleFileReady} />
              
              {errorMsg && (
                <div className="max-w-2xl mx-auto mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-medium">
                  {errorMsg}
                </div>
              )}
            </motion.div>
          )}

          {appState === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center"
            >
              <ProgressBar 
                progress={progressData.progress}
                label={progressData.label}
                engine="Tesseract.js"
              />
            </motion.div>
          )}

          {appState === 'DONE' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-[500px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-accent">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">{file?.name}</h3>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={handleCopy}
                    className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download TXT
                  </button>
                </div>
              </div>
              
              <textarea 
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#7c3aed transparent' }}
                className="flex-grow w-full bg-transparent text-gray-200 p-6 resize-none focus:outline-none leading-relaxed"
                placeholder="Extracted text will appear here..."
              />

              <div className="p-4 border-t border-white/10 bg-black/20 text-center">
                <button
                  onClick={() => {
                    setAppState('IDLE');
                    setFile(null);
                    setExtractedText('');
                  }}
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Extract Another File
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
