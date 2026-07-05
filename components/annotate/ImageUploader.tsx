'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { annotateApi } from '@/lib/api';
import useAnnotateStore from '@/store/annotateStore';
import useToastStore from '@/store/toastStore';
import { cn } from '@/lib/utils';

export default function ImageUploader() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fetchImages, setActiveImage } = useAnnotateStore();
  const { addToast } = useToastStore();

  const handleUpload = async (file: File) => {
    // Only allow images
    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file (PNG, JPG, etc.)', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', file.name);

    try {
      const response = await annotateApi.uploadImage(formData);
      const newImg = response.data.data;
      
      addToast('Image uploaded successfully', 'success');
      await fetchImages();
      
      // Select the newly uploaded image
      setActiveImage(newImg);
    } catch (error) {
      console.error('Failed to upload image:', error);
      addToast('Failed to upload image. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={cn(
        'relative flex flex-col items-center justify-center p-6 border border-dashed rounded-xl cursor-pointer transition-all duration-200 min-h-[140px]',
        'bg-[#111118]/40 border-white/10 hover:border-[#8b5cf6]/50 hover:bg-[#7c3aed]/5',
        isDragActive && 'border-[#8b5cf6] bg-[#7c3aed]/10 ring-2 ring-[#7c3aed]/20',
        uploading && 'opacity-60 cursor-not-allowed pointer-events-none'
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2 text-sm text-[#a1a1aa]">
          <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
          <span>Uploading image...</span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/8 text-[#71717a] group-hover:text-[#fafafa] transition-colors duration-200">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-[#fafafa] tracking-wide mt-1">
            Drag & drop or click to upload
          </p>
          <p className="text-[10px] text-[#71717a]">
            Supports JPG, PNG, WEBP (Max 5MB)
          </p>
        </div>
      )}
    </div>
  );
}
