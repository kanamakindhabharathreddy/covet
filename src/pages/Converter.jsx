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
    if (engine !== 'ffmpeg' && engine !== 'canvas' && engine !== 'data' && engine !== 'sheetjs' && engine !== 'huggingface' && engine !== 'huggingface_unlock' && engine !== 'mammoth' && engine !== 'docx') {
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
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-extrabold text-white mb-3">Universal Converter</h1>
        <p className="text-lg text-gray-400">Transform your files securely inside your browser.</p>
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
              <div className="w-full max-w-2xl bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-6 shadow-xl backdrop-blur-md">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                  {iconMap[detectedType.category] || iconMap.unknown}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">{file.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatSize(file.size)} • <span className="uppercase text-[#a78bfa]">{detectedType.extension}</span> • <span className="capitalize">{detectedType.category}</span>
                  </p>
                </div>
                <button 
                  onClick={resetState}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
                  title="Change File"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="w-full max-w-2xl p-8 mt-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-center shadow-xl backdrop-blur-md"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">Conversion Failed</h3>
              <p className="text-red-300/80 mb-8 max-w-md mx-auto">{errorMsg}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (errorMsg.includes("Wrong password")) {
                    setAppState('PASSWORD_PROMPT');
                  } else {
                    resetState();
                  }
                }}
                className="px-10 py-4 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
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
                fileName={null} 
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
