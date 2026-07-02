import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ progress = 0, label = "Processing...", engine }) {
  const isDone = progress >= 100;
  const isLoading = progress <= 0;

  const currentLabel = isDone ? 'Done!' : label;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        width: '100%',
        maxWidth: '42rem',
        margin: '2rem auto',
        padding: 24,
        borderRadius: 12,
        background: '#0f0f0f',
        border: '1px solid #1e1e1e',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <h4 style={{
          fontSize: 16,
          fontWeight: 600,
          color: isDone ? '#22c55e' : '#fffbf5',
          transition: 'color 0.3s',
        }}>
          {currentLabel}
        </h4>

        {engine && (
          <div style={{
            padding: '4px 10px',
            borderRadius: 5,
            background: 'rgba(212,168,67,0.08)',
            border: '1px solid rgba(212,168,67,0.15)',
          }}>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#d4a843',
              fontFamily: 'monospace',
            }}>
              {engine}
            </span>
          </div>
        )}
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        height: 4,
        background: '#1e1e1e',
        borderRadius: 99,
        overflow: 'hidden',
        marginBottom: 8,
      }}>
        {isLoading ? (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(212,168,67,0.06)' }}>
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: '50%',
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.6), transparent)',
              }}
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
            style={{
              height: '100%',
              borderRadius: 99,
              backgroundImage: isDone
                ? 'linear-gradient(90deg, #059669, #34d399)'
                : 'linear-gradient(90deg, #a07c2e, #d4a843)',
              boxShadow: isDone
                ? '0 0 10px rgba(34,197,94,0.4)'
                : '0 0 10px rgba(212,168,67,0.3)',
              transition: 'background-image 0.3s',
            }}
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'monospace',
          color: isDone ? '#22c55e' : '#52525b',
          transition: 'color 0.3s',
        }}>
          {isLoading ? '0%' : `${Math.round(progress)}%`}
        </span>
      </div>
    </motion.div>
  );
}
