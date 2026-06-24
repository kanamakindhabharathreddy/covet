import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ progress = 0, label = "Processing...", engine }) {
  const isDone = progress >= 100;
  const isLoading = progress <= 0;

  const currentLabel = isDone ? 'Done!' : label;
  const barColor = isDone ? 'bg-green-500' : 'bg-accent';
  const shadowColor = isDone ? 'shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'shadow-[0_0_15px_rgba(124,58,237,0.5)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mt-8"
    >
      <div className="flex justify-between items-end mb-4">
        <h4 className={`text-lg font-medium transition-colors duration-300 ${isDone ? 'text-green-400' : 'text-white'}`}>
          {currentLabel}
        </h4>

        {engine && (
          <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa]">
              {engine}
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full h-3 bg-black/60 rounded-full overflow-hidden mb-2">
        {isLoading ? (
          <div className="absolute inset-0 bg-accent/10">
            <motion.div
              className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-accent/80 to-transparent"
              animate={{ x: ['-100%', '250%'] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: 'linear',
              }}
            />
          </div>
        ) : (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`h-full rounded-full transition-colors duration-300 ${barColor} ${shadowColor}`}
          />
        )}
      </div>

      <div className="flex justify-end">
        <span className={`text-sm font-bold tracking-wide transition-colors duration-300 ${isDone ? 'text-green-400' : 'text-gray-400'}`}>
          {isLoading ? '0%' : `${Math.round(progress)}%`}
        </span>
      </div>
    </motion.div>
  );
}
