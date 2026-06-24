import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const categories = [
    { name: 'Audio', icon: '🎵', desc: 'MP3, WAV, FLAC, AAC' },
    { name: 'Video', icon: '🎬', desc: 'MP4, WEBM, AVI, MKV' },
    { name: 'Image', icon: '🖼️', desc: 'JPG, PNG, WEBP, GIF' },
    { name: 'Document', icon: '📄', desc: 'DOCX, PDF, TXT' },
    { name: 'Spreadsheet', icon: '📊', desc: 'XLSX, CSV' },
    { name: 'Data Formats', icon: '🔡', desc: 'JSON, XML, YAML' },
    { name: 'OCR', icon: '🔍', desc: 'Extract Text from Images' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-between px-4 pt-20 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl text-center z-10 flex flex-col items-center"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
          Convert Everything.<br />
          <span className="text-accent">Upload Nothing.</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
          All conversions happen on your device. Your files never leave your browser.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center w-full max-w-md mx-auto sm:max-w-none">
          <Link to="/convert" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-8 py-4 rounded-full bg-accent text-white font-semibold text-lg shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all"
            >
              Convert Files
            </motion.button>
          </Link>
          <Link to="/ocr" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              Extract Text (OCR)
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Grid Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl mx-auto mt-24 mb-16 z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-center">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              variants={itemVariants}
              whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-colors text-center ${
                categories.length % 2 !== 0 && index === categories.length - 1 
                  ? 'md:col-start-2 lg:col-auto' // Basic centering trick for the last odd item depending on layout
                  : ''
              }`}
            >
              <span className="text-4xl mb-3">{cat.icon}</span>
              <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-auto text-center z-10 w-full pb-4"
      >
        <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Built with WebAssembly. Powered by your device.
        </p>
      </motion.footer>
    </div>
  );
}
