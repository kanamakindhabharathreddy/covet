import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableImageItem({ id, file, previewUrl, pageNum, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative flex items-center gap-4 p-4 mb-3 rounded-2xl border transition-colors ${
        isDragging 
          ? 'bg-accent/20 border-accent/50 shadow-xl' 
          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 text-gray-500 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/50 border border-white/5 flex-shrink-0">
        <img 
          src={previewUrl} 
          alt={file.name} 
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate text-sm">{file.name}</h4>
        <span className="text-xs font-bold text-accent uppercase tracking-wider">Page {pageNum}</span>
      </div>

      {/* Remove Button */}
      <button 
        onClick={() => onRemove(id)}
        className="p-2 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Remove Page"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
