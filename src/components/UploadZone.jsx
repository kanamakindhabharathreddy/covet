import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectFileType } from '../utils/fileDetector';
import { fileLimits } from '../config/fileLimits';

export default function UploadZone({ onFileReady }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const processFile = async (file) => {
    setError(null);
    if (!file) return;

    try {
      const detectedType = await detectFileType(file);
      
      if (detectedType.category === 'unknown') {
        setError('Unsupported file format.');
        return;
      }

      const limit = fileLimits[detectedType.category];
      if (limit && file.size > limit) {
        const limitMB = (limit / (1024 * 1024)).toFixed(0);
        setError(`File size exceeds the ${limitMB}MB limit for ${detectedType.category} files.`);
        return;
      }

      setSelectedFile({
        file,
        name: file.name,
        size: file.size,
        type: detectedType
      });

      if (onFileReady) {
        onFileReady(file, detectedType);
      }
    } catch (err) {
      setError('An error occurred while reading the file.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
    // reset so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-12 text-center rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
          isDragActive
            ? 'border-accent bg-accent/10 border-solid shadow-[0_0_20px_rgba(124,58,237,0.3)]'
            : 'border-accent/50 bg-white/5 border-dashed hover:border-accent hover:bg-accent/5'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          title="File Upload"
        />

        {!selectedFile ? (
          <>
            <div className={`w-16 h-16 mb-6 rounded-full flex items-center justify-center transition-colors duration-300 ${isDragActive ? 'bg-accent/30' : 'bg-gray-800'}`}>
              <svg className={`w-8 h-8 transition-colors duration-300 ${isDragActive ? 'text-white' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-200 mb-2">
              {isDragActive ? 'Drop your file here...' : 'Click to browse or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">
              Supports Audio, Video, Image, Document, Data, and Spreadsheet files
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="w-16 h-16 mb-4 rounded-xl bg-accent/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-white break-all max-w-[90%] truncate">{selectedFile.name}</p>
            <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
              <span className="px-2 py-1 rounded bg-black/30 border border-white/10 uppercase tracking-wider text-xs font-semibold text-gray-300">
                {selectedFile.type.extension || 'UNKNOWN'}
              </span>
              <span>•</span>
              <span className="capitalize">{selectedFile.type.category}</span>
              <span>•</span>
              <span>{formatSize(selectedFile.size)}</span>
            </div>
            <p className="mt-6 text-xs text-gray-500 hover:text-white transition-colors">
              Click or drag another file to replace
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
