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
        className="relative flex flex-col items-center justify-center p-12 text-center cursor-pointer"
        style={{
          minHeight: 280,
          background: isDragActive ? 'rgba(212,168,67,0.03)' : '#0f0f0f',
          border: isDragActive ? '1.5px solid rgba(212,168,67,0.4)' : '1px solid #1e1e1e',
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'all 0.15s ease',
        }}
      >
        <div className="upload-glow" />

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          title="File Upload"
        />

        {!selectedFile ? (
          <>
            <div style={{
              width: 64,
              height: 64,
              background: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              position: 'relative',
              zIndex: 1,
            }}>
              <svg style={{ width: 28, height: 28, color: '#d4a843' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#fffbf5', marginBottom: 8, position: 'relative', zIndex: 1 }}>
              {isDragActive ? 'Drop it here' : 'Drop anything here'}
            </p>
            <p style={{ color: '#2a2a2a', fontSize: 13, fontFamily: 'monospace', position: 'relative', zIndex: 1 }}>
              Audio · Video · Images · Documents · Data
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center w-full" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 56,
              height: 56,
              marginBottom: 16,
              borderRadius: 12,
              background: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg style={{ width: 24, height: 24, color: '#d4a843' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fffbf5', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</p>
            <div className="flex items-center gap-3 mt-3" style={{ fontSize: 13, color: '#52525b' }}>
              <span style={{
                padding: '2px 8px',
                borderRadius: 5,
                background: '#141414',
                border: '1px solid #1e1e1e',
                fontSize: 11,
                fontWeight: 600,
                color: '#52525b',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}>
                {selectedFile.type.extension || 'UNKNOWN'}
              </span>
              <span>·</span>
              <span className="capitalize">{selectedFile.type.category}</span>
              <span>·</span>
              <span>{formatSize(selectedFile.size)}</span>
            </div>
            <p style={{ marginTop: 20, fontSize: 12, color: '#2a2a2a' }} className="hover:text-white transition-colors">
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
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 10,
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <svg style={{ width: 18, height: 18, color: '#ef4444', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#ef4444' }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
