import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from '../components/UploadZone';
import FormatSelector from '../components/FormatSelector';
import ProgressBar from '../components/ProgressBar';
import DownloadCard from '../components/DownloadCard';
import MultiImagePdfBuilder from '../components/MultiImagePdfBuilder';
import PasswordPrompt from '../components/PasswordPrompt';
import { convertWithFFmpeg } from '../converters/ffmpegConverter';
import { convertImage } from '../converters/imageConverter';
import { convertData } from '../converters/dataConverter';
import { convertSpreadsheet } from '../converters/spreadsheetConverter';
import { convertViaHuggingFace } from '../converters/huggingFaceConverter';
import { convertDocument } from '../converters/documentConverter';
import { convertMarkdown } from '../converters/markdownConverter';

const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const iconMap = {
  audio: '🎵',
  video: '🎬',
  image: '🖼️',
  document: '📄',
  spreadsheet: '📊',
  data: '🔡',
  ocr: '🔍',
  unknown: '📁'
};

export default function Converter() {
  // State Machine: IDLE -> SELECTED -> PASSWORD_PROMPT -> BUILDING_PDF -> CONVERTING -> DONE
  const [appState, setAppState] = useState('IDLE'); 
  const [password, setPassword] = useState('');
  
  const [file, setFile] = useState(null);
  const [detectedType, setDetectedType] = useState(null);
  const [targetFormat, setTargetFormat] = useState(null);
  
  const [progressData, setProgressData] = useState({ progress: 0, label: '', engine: '' });
  const [resultBlob, setResultBlob] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const resetState = () => {
    setAppState('IDLE');
    setFile(null);
    setDetectedType(null);
    setTargetFormat(null);
    setResultBlob(null);
    setErrorMsg(null);
    setProgressData({ progress: 0, label: '', engine: '' });
    setPassword('');
  };

  const handleFileReady = (selectedFile, type) => {
    setFile(selectedFile);
    setDetectedType(type);
    setAppState('SELECTED');
    setErrorMsg(null);
  };

  const handleConvert = async (format, engine, explicitPassword = null) => {
    setTargetFormat(format);
    setErrorMsg(null);

    // If it's a multi-image PDF build, branch off early
    if (engine === 'jspdf') {
      setAppState('BUILDING_PDF');
      return;
    }

    if (engine === 'huggingface_unlock' && explicitPassword === null) {
      setAppState('PASSWORD_PROMPT');
      return;
    }

    // Mock other engines via Toast as requested
    if (engine !== 'ffmpeg' && engine !== 'canvas' && engine !== 'data' && engine !== 'sheetjs' && engine !== 'huggingface' && engine !== 'huggingface_unlock' && engine !== 'mammoth' && engine !== 'docx' && engine !== 'marked') {
      setErrorMsg(`Support for the ${engine} engine is coming soon!`);
      return;
    }

    setAppState('CONVERTING');
    let engineLabel = 'Browser Engine';
    if (engine === 'ffmpeg') engineLabel = 'FFmpeg.wasm';
    else if (engine === 'canvas') engineLabel = 'Browser Canvas';
    else if (engine === 'sheetjs') engineLabel = 'SheetJS';
    else if (engine === 'data') engineLabel = 'Data Parser';
    else if (engine === 'huggingface' || engine === 'huggingface_unlock') engineLabel = 'HuggingFace Space';
    else if (engine === 'mammoth') engineLabel = 'Mammoth Engine';
    else if (engine === 'docx') engineLabel = 'Docx Engine';
    else if (engine === 'marked') engineLabel = 'Marked Engine';
    
    setProgressData({ progress: 0, label: 'Initializing...', engine: engineLabel });

    try {
      let blob;
      if (engine === 'ffmpeg') {
        blob = await convertWithFFmpeg(file, format, (prog) => {
          if (prog.status === 'loading') {
            setProgressData({ progress: 0, label: prog.message, engine: engineLabel });
          } else if (prog.status === 'processing') {
            setProgressData({ 
              progress: Math.min(Math.round(prog.ratio * 100), 100), 
              label: 'Processing...', 
              engine: engineLabel 
            });
          }
        });
      } else if (engine === 'canvas') {
        blob = await convertImage(file, format, (prog) => {
          setProgressData({ 
            progress: Math.min(Math.round(prog.ratio * 100), 100), 
            label: prog.message || 'Processing...', 
            engine: engineLabel 
          });
        });
      } else if (engine === 'data') {
        blob = await convertData(file, format, (prog) => {
          setProgressData({ 
            progress: Math.min(Math.round(prog.ratio * 100), 100), 
            label: prog.message || 'Processing...', 
            engine: engineLabel 
          });
        });
      } else if (engine === 'sheetjs') {
        blob = await convertSpreadsheet(file, format, (prog) => {
          setProgressData({ 
            progress: Math.min(Math.round(prog.ratio * 100), 100), 
            label: prog.message || 'Processing...', 
            engine: engineLabel 
          });
        });
      } else if (engine === 'huggingface' || engine === 'huggingface_unlock') {
        blob = await convertViaHuggingFace(file, format, (prog) => {
          setProgressData({ 
            progress: Math.min(Math.round(prog.ratio * 100), 100), 
            label: prog.message || 'Processing...', 
            engine: engineLabel 
          });
        }, explicitPassword || password);
      } else if (engine === 'mammoth' || engine === 'docx') {
        blob = await convertDocument(file, format, (prog) => {
          setProgressData({ 
            progress: Math.min(Math.round(prog.ratio * 100), 100), 
            label: prog.message || 'Processing...', 
            engine: engineLabel 
          });
        });
      } else if (engine === 'marked') {
        blob = await convertMarkdown(file, format, (prog) => {
          setProgressData({ 
            progress: Math.min(Math.round(prog.ratio * 100), 100), 
            label: prog.message || 'Processing...', 
            engine: engineLabel 
          });
        });
      }
      setResultBlob(blob);
      setAppState('DONE');
      setPassword('');
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred during conversion.');
      // Keep appState as CONVERTING but errorMsg will trigger the Error Card
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col items-center flex-grow">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center flex flex-col items-center"
      >
        <span style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}>COVET / CONVERT</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fffbf5', marginTop: 8 }}>Drop your file.</h1>
      </motion.div>

      <div className="w-full max-w-4xl relative min-h-[400px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          
          {appState === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <UploadZone onFileReady={handleFileReady} />
            </motion.div>
          )}

          {appState === 'SELECTED' && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              {/* File Info Card */}
              <div 
                className="w-full max-w-2xl p-6 rounded-[16px] flex items-center gap-6"
                style={{
                  background: '#0f0f0f',
                  border: '1px solid #1e1e1e',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(212,168,67,0.08)',
                  border: '1px solid rgba(212,168,67,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {iconMap[detectedType.category] || iconMap.unknown}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fffbf5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#52525b', background: '#141414', border: '1px solid #1e1e1e', padding: '2px 8px', borderRadius: 5, fontFamily: 'monospace' }}>
                      {formatSize(file.size)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#d4a843', textTransform: 'uppercase', background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', padding: '2px 8px', borderRadius: 5, fontFamily: 'monospace' }}>
                      {detectedType.extension}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={resetState}
                  style={{
                    padding: 10, borderRadius: '50%',
                    background: '#141414', border: '1px solid #1e1e1e',
                    color: '#52525b', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fffbf5'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; e.currentTarget.style.borderColor = '#1e1e1e'; }}
                  title="Change File"
                >
                  <svg style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <FormatSelector 
                fileType={detectedType.extension} 
                category={detectedType.category} 
                onConvert={handleConvert}
              />

              {/* Toast for "Coming Soon" engines */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium w-full max-w-2xl text-center shadow-lg"
                  >
                    🚧 {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {appState === 'PASSWORD_PROMPT' && (
            <PasswordPrompt 
              onCancel={() => setAppState('SELECTED')}
              onSubmit={(pwd) => {
                setPassword(pwd);
                handleConvert('unlock', 'huggingface_unlock', pwd);
              }}
            />
          )}

          {appState === 'BUILDING_PDF' && (
            <MultiImagePdfBuilder 
              initialFile={file}
              onCancel={() => setAppState('SELECTED')}
              onComplete={(pdfBlob) => {
                setResultBlob(pdfBlob);
                setTargetFormat('pdf');
                setAppState('DONE');
              }}
            />
          )}

          {appState === 'CONVERTING' && !errorMsg && (
            <motion.div
              key="converting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <ProgressBar 
                progress={progressData.progress} 
                label={progressData.label} 
                engine={progressData.engine} 
              />
            </motion.div>
          )}

          {errorMsg && appState === 'CONVERTING' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                width: '100%',
                maxWidth: 420,
                marginTop: 32,
                padding: '32px 24px',
                borderRadius: 16,
                background: '#0f0f0f',
                border: '1px solid #1e1e1e',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}>
                <svg style={{ width: 32, height: 32 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Conversion Failed</h3>
              <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 32, lineHeight: 1.5 }}>{errorMsg}</p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (errorMsg.includes("Wrong password")) {
                    setAppState('PASSWORD_PROMPT');
                  } else {
                    resetState();
                  }
                }}
                style={{
                  padding: '12px 32px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid #1e1e1e',
                  color: '#fffbf5',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e1e1e';
                  e.currentTarget.style.color = '#fffbf5';
                }}
              >
                Try Again
              </motion.button>
            </motion.div>
          )}

          {appState === 'DONE' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="w-full"
            >
              <DownloadCard 
                blob={resultBlob} 
                fileName={targetFormat === 'unlock' && file?.name ? file.name.replace(/\.pdf$/i, '_unlocked.pdf') : null} 
                targetFormat={targetFormat} 
                originalName={file?.name} 
                onReset={resetState} 
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
