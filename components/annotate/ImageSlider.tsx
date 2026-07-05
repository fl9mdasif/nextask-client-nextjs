'use client';

import { useEffect, useState } from 'react';
import { Trash2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import useAnnotateStore from '@/store/annotateStore';
import { annotateApi } from '@/lib/api';
import useToastStore from '@/store/toastStore';
import { cn } from '@/lib/utils';

export default function ImageSlider() {
  const { images, activeImage, setActiveImage, fetchImages } = useAnnotateStore();
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages().finally(() => setLoading(false));
  }, [fetchImages]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent selecting the image

    if (!confirm('Are you sure you want to delete this image? All associated annotations will be lost.')) {
      return;
    }

    try {
      await annotateApi.deleteImage(id);
      addToast('Image deleted successfully', 'success');
      
      // If the deleted image was active, clear active image selection
      if (activeImage?.id === id) {
        // Find another image to set active if possible
        const remaining = images.filter((img) => img.id !== id);
        if (remaining.length > 0) {
          setActiveImage(remaining[0]);
        } else {
          // Clear active image by setting state directly or by passing dummy value
          // Since setActiveImage expects AnnotationImage, we might need a reset store action or just let it stay null.
          // Wait,setActiveImage accepts AnnotationImage. Let's cast null.
          const store = useAnnotateStore.getState();
          useAnnotateStore.setState({ activeImage: null, polygons: [] });
        }
      }
      
      fetchImages();
    } catch (error) {
      console.error('Failed to delete image:', error);
      addToast('Failed to delete image', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 w-full opacity-60" />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-4 rounded-xl border border-dashed border-white/8 bg-white/[0.01] text-center">
        <ImageIcon className="w-8 h-8 text-[#52525b] mb-2" />
        <p className="text-xs font-medium text-[#a1a1aa]">No images uploaded yet</p>
        <p className="text-[10px] text-[#71717a] mt-0.5">Upload a scan or photo to start annotating</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 mt-4 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
      {images.map((img) => {
        const isActive = activeImage?.id === img.id;

        return (
          <div
            key={img.id}
            id={`image-item-${img.id}`}
            onClick={() => setActiveImage(img)}
            className={cn(
              'group relative flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-200',
              isActive
                ? 'bg-[#7c3aed]/10 border-[#7c3aed] shadow-md shadow-[#7c3aed]/5'
                : 'bg-[#111118]/60 border-white/8 hover:border-white/16 hover:bg-white/[0.03]'
            )}
          >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black shrink-0 border border-white/5 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image}
                alt={img.name}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </div>

            {/* Title / Info */}
            <div className="flex-1 min-w-0 pr-6">
              <p className="text-xs font-semibold text-[#fafafa] truncate leading-tight">
                {img.name}
              </p>
              <p className="text-[9px] text-[#71717a] mt-1">
                {new Date(img.uploaded_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Trash button */}
            <button
              id={`delete-image-${img.id}`}
              onClick={(e) => handleDelete(e, img.id)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[#52525b] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              aria-label="Delete image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
