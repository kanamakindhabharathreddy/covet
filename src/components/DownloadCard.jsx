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
      className="w-full max-w-md mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm mt-8 flex flex-col items-center text-center shadow-xl relative overflow-hidden"
    >
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-[60px] pointer-events-none" />

      <div className="w-24 h-24 mb-6 rounded-full bg-accent/20 flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(124,58,237,0.3)] z-10">
        {displayIcon}
      </div>

      <h3 className="text-xl font-bold text-white mb-2 break-all line-clamp-2 z-10">
        {finalFileName}
      </h3>
      
      <p className="text-gray-400 font-medium mb-8 z-10">
        {formatSize(blob?.size)} • <span className="uppercase text-accent-light">{targetFormat}</span>
      </p>

      <motion.button
        onClick={handleDownload}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full py-4 mb-4 rounded-xl bg-accent text-white font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center gap-3 z-10"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </motion.button>

      {onReset && (
        <button
          onClick={onReset}
          className="text-sm font-medium text-gray-500 hover:text-white transition-colors z-10 px-4 py-2"
        >
          Convert Another
        </button>
      )}
    </motion.div>
  );
}
