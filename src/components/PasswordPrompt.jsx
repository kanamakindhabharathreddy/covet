import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PasswordPrompt({ onSubmit, onCancel }) {
  const [password, setPassword] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSubmit(password);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-center flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">Password Protected</h3>
        <p className="text-gray-400 mb-8">Enter the password to unlock this PDF</p>
        
        <input 
          type="password" 
          placeholder="Enter PDF password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent mb-8"
        />
        
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit(password)}
            className="flex-1 py-4 px-6 rounded-xl bg-accent text-white font-bold shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all"
          >
            Unlock
          </button>
        </div>
      </motion.div>
    </div>
  );
}
