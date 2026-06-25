import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { jsPDF } from 'jspdf';
import SortableImageItem from './SortableImageItem';
import ProgressBar from './ProgressBar';

export default function MultiImagePdfBuilder({ initialFile, onComplete, onCancel }) {
  const [items, setItems] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progressData, setProgressData] = useState({ progress: 0, label: '' });
  const fileInputRef = useRef(null);

  // Initialize with the first dropped file
  useEffect(() => {
    if (initialFile && items.length === 0) {
      const id = Math.random().toString(36).substring(2, 9);
      const previewUrl = URL.createObjectURL(initialFile);
      setItems([{ id, file: initialFile, previewUrl }]);
    }
    // Cleanup URLs on unmount
    return () => {
      items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px movement required before drag starts
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemove = (id) => {
    setItems((prev) => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      const filtered = prev.filter(i => i.id !== id);
      if (filtered.length === 0) {
        onCancel(); // If all items removed, go back to start
      }
      return filtered;
    });
  };

  const handleAddFiles = (e) => {
    if (!e.target.files?.length) return;
    const newItems = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setItems(prev => [...prev, ...newItems]);
    e.target.value = ''; // Reset input
  };

  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const handleGeneratePdf = async () => {
    if (items.length === 0) return;
    setIsConverting(true);
    setProgressData({ progress: 0, label: 'Initializing PDF...' });

    try {
      // Create PDF - orient 'p' for portrait, format will be dynamically set per page
      const doc = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      doc.deletePage(1); // Remove default first page

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        setProgressData({ 
          progress: Math.round((i / items.length) * 100), 
          label: `Processing Page ${i + 1} of ${items.length}...` 
        });

        const img = await loadImage(item.previewUrl);
        
        // Add new page sizing perfectly to image dimensions
        doc.addPage([img.naturalWidth, img.naturalHeight], img.naturalWidth > img.naturalHeight ? 'l' : 'p');
        
        // Determine format for jsPDF (JPEG, PNG, WEBP)
        let imgFormat = 'JPEG';
        if (item.file.type === 'image/png') imgFormat = 'PNG';
        else if (item.file.type === 'image/webp') imgFormat = 'WEBP';
        // bmp, gif fallback to JPEG visually in jsPDF

        doc.addImage(img, imgFormat, 0, 0, img.naturalWidth, img.naturalHeight);
      }

      setProgressData({ progress: 100, label: 'Finalizing PDF...' });
      
      const pdfBlob = doc.output('blob');
      onComplete(pdfBlob);

    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
      setIsConverting(false);
    }
  };

  if (isConverting) {
    return (
      <div className="w-full">
        <ProgressBar 
          progress={progressData.progress} 
          label={progressData.label} 
          engine="jsPDF Engine" 
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-2xl bg-white/5 border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Build PDF</h3>
          <p className="text-sm text-gray-400">Drag to reorder pages</p>
        </div>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item, index) => (
              <SortableImageItem 
                key={item.id} 
                id={item.id}
                file={item.file}
                previewUrl={item.previewUrl}
                pageNum={index + 1}
                onRemove={handleRemove}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-white/10">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleAddFiles} 
          className="hidden" 
          multiple 
          accept="image/jpeg,image/png,image/webp,image/bmp" 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-dashed border-white/20 text-gray-300 hover:text-white hover:border-accent hover:bg-accent/10 transition-colors w-full"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add More Images
        </button>

        <button
          onClick={handleGeneratePdf}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all w-full"
        >
          Convert to PDF
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
