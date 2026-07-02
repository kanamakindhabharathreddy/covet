import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getCategoryFromExtension } from '../utils/fileDetector';

export default function DownloadCard({ blob, fileName, targetFormat, originalName, onReset }) {
  // Determine the file's category dynamically based on its new targetFormat extension
  const category = useMemo(() => {
    if (targetFormat === 'unlock' || targetFormat === 'pdf') return targetFormat;
    return getCategoryFromExtension(targetFormat);
  }, [targetFormat]);
  
  const iconMap = {
    audio: '🎵',
    video: '🎬',
    image: '🖼️',
    document: '📄',
    spreadsheet: '📊',
    data: '🔡',
    ocr: '🔍',
    unlock: '📄',
    pdf: '📄',
    unknown: '📁'
  };

  const displayIcon = iconMap[category] || iconMap.unknown;

  // Compute the final filename safely
  const baseName = originalName 
    ? originalName.substring(0, originalName.lastIndexOf('.')) || originalName 
    : 'converted';
  const finalFileName = fileName || `${baseName}.${targetFormat}`;

  // Human readable size formatter
  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Safe client-side download logic utilizing a hidden anchor tag
  const handleDownload = () => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Cleanup URL reference after a brief delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        width: '100%',
        maxWidth: 420,
        margin: '0 auto',
        padding: 32,
        borderRadius: 16,
        background: '#0f0f0f',
        border: '1px solid #1e1e1e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: 80,
        height: 80,
        marginBottom: 24,
        borderRadius: '50%',
        background: 'rgba(212,168,67,0.08)',
        border: '1px solid rgba(212,168,67,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
      }}>
        {displayIcon}
      </div>

      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#fffbf5',
        marginBottom: 8,
        wordBreak: 'break-all',
        maxWidth: '100%',
      }}>
        {finalFileName}
      </h3>
      
      <p style={{ color: '#52525b', fontWeight: 500, marginBottom: 28, fontSize: 14 }}>
        {formatSize(blob?.size)} · <span style={{ textTransform: 'uppercase', color: '#d4a843', fontFamily: 'monospace', fontWeight: 600 }}>{targetFormat}</span>
      </p>

      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        style={{
          width: '100%',
          padding: '14px 0',
          marginBottom: 16,
          borderRadius: 10,
          background: '#d4a843',
          color: '#050505',
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.15s',
        }}
      >
        <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </motion.button>

      {onReset && (
        <button
          onClick={onReset}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: '#52525b',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 16px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#fffbf5'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#52525b'; }}
        >
          Convert Another
        </button>
      )}
    </motion.div>
  );
}
