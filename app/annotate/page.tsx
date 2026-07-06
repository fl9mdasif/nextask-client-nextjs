'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Tag, Trash2, HelpCircle, ImageIcon } from 'lucide-react';
import useAnnotateStore from '@/store/annotateStore';
import { annotateApi } from '@/lib/api';
import useToastStore from '@/store/toastStore';
import ImageUploader from '@/components/annotate/ImageUploader';
import ImageSlider from '@/components/annotate/ImageSlider';
import type { Point } from '@/src/interfaces';
import { cn } from '@/lib/utils';


// Dynamically import AnnotationCanvas with SSR disabled
const AnnotationCanvas = dynamic(
  () => import('@/components/annotate/AnnotationCanvas'),
  { ssr: false }
);

// Presets for label coloring
const COLOR_PRESETS = [
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Yellow', hex: '#eab308' },
];

export default function AnnotatePage() {
  const {
    activeImage,
    polygons,
    fetchPolygons,
  } = useAnnotateStore();

  const { addToast } = useToastStore();
  const router = useRouter();

  // Selected label & color properties for drawing
  const [activeLabel, setActiveLabel] = useState('Annotation');
  const [activeColor, setActiveColor] = useState('#7c3aed');

  // Guard: if localStorage has no token redirect to login instead
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
      router.replace('/login');
    }
  }, [router]);

  // Fetch polygons when active image changes
  useEffect(() => {
    if (activeImage) {
      fetchPolygons(activeImage.id);
    }
  }, [activeImage, fetchPolygons]);

  // Save polygon callback
  const handlePolygonSave = async (points: Point[]) => {
    if (!activeImage) return;

    try {
      await annotateApi.createPolygon(activeImage.id, {
        points,
        label: activeLabel.trim() || 'Annotation',
        color: activeColor,
      });

      addToast('Polygon saved successfully', 'success');
      // Refresh polygons list from backend
      fetchPolygons(activeImage.id);
    } catch (error) {
      console.error('Failed to save polygon:', error);
      addToast('Failed to save annotation', 'error');
    }
  };

  // Delete polygon callback
  const handlePolygonDelete = async (id: number) => {
    if (!activeImage) return;

    try {
      await annotateApi.deletePolygon(id);
      addToast('Polygon deleted', 'success');
      fetchPolygons(activeImage.id);
    } catch (error) {
      console.error('Failed to delete polygon:', error);
      addToast('Failed to delete annotation', 'error');
    }
  };

  // Clear all polygons for current image
  const handleClearAll = async () => {
    if (!activeImage || polygons.length === 0) return;

    if (!confirm('Are you sure you want to delete ALL annotations on this image?')) {
      return;
    }

    try {
      // Loop through all polygons and delete them
      // Alternatively, if the backend has a clear all view we would call it.
      // Since it doesn't, we will delete each individually:
      await Promise.all(polygons.map((p) => annotateApi.deletePolygon(p.id)));
      addToast('All annotations cleared', 'success');
      fetchPolygons(activeImage.id);
    } catch (error) {
      console.error('Failed to clear annotations:', error);
      addToast('Failed to clear some annotations', 'error');
    }
  };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row gap-6">
        {/* ── Left Sidebar (Upload & Image List) ── */}
        <section className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          <div className="glass rounded-2xl p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-[#fafafa] mb-3">Upload Scan</h2>
            <ImageUploader />
          </div>

          <div className="glass rounded-2xl p-5 shadow-xl flex-1">
            <h2 className="text-sm font-semibold text-[#fafafa] mb-1">Scans Gallery</h2>
            <p className="text-[10px] text-[#71717a] mb-3">Select a scan to begin drawing overlays</p>
            <ImageSlider />
          </div>
        </section>

        {/* ── Right Panel (Canvas & Detail Settings) ── */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          {activeImage ? (
            <div className="glass rounded-2xl p-6 shadow-xl flex flex-col gap-5">
              {/* Image Title Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/6 pb-4">
                <div>
                  <h1 className="text-base font-bold text-[#fafafa] leading-tight truncate max-w-[320px]">
                    {activeImage.name}
                  </h1>
                  <p className="text-xs text-[#71717a] mt-1">
                    Dimensions: natural resolution &bull; {polygons.length} annotation{polygons.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {polygons.length > 0 && (
                    <button
                      id="clear-all-annotations"
                      onClick={handleClearAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-150"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All ({polygons.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Configure Current Active Label & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                {/* Active Label input */}
                <div>
                  <label htmlFor="active-label-input" className="block text-[10px] font-semibold tracking-wider text-[#71717a] uppercase mb-1.5">
                    Drawing Label
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#52525b]" />
                    <input
                      id="active-label-input"
                      type="text"
                      value={activeLabel}
                      onChange={(e) => setActiveLabel(e.target.value)}
                      placeholder="e.g. Tumor, Fracture"
                      className={cn(
                        'w-full h-9 pl-9 pr-3 rounded-lg text-xs text-[#fafafa] bg-[#16161f]',
                        'border border-white/8 outline-none',
                        'hover:border-white/16 focus:border-[#7c3aed]',
                        'transition-all duration-200'
                      )}
                    />
                  </div>
                </div>

                {/* Color select presets */}
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider text-[#71717a] uppercase mb-1.5">
                    Annotation Color
                  </label>
                  <div className="flex items-center gap-2 h-9">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setActiveColor(color.hex)}
                        title={color.name}
                        className={cn(
                          'w-6 h-6 rounded-full border transition-all duration-150',
                          activeColor === color.hex
                            ? 'scale-110 border-white ring-2 ring-[#7c3aed]/40'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color.hex }}
                        aria-label={`Select ${color.name}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Konva Drawing Canvas */}
              <AnnotationCanvas
                image={activeImage}
                polygons={polygons}
                onPolygonSave={handlePolygonSave}
                onPolygonDelete={handlePolygonDelete}
              />

              {/* ── Polygons detail list below canvas ── */}
              <div className="border-t border-white/6 pt-5">
                <h3 className="text-xs font-semibold text-[#fafafa] mb-3">
                  Annotations Overlay ({polygons.length})
                </h3>

                {polygons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-white/8 rounded-xl bg-white/[0.005] text-center">
                    <HelpCircle className="w-6 h-6 text-[#52525b] mb-1.5" />
                    <p className="text-xs text-[#71717a]">No annotations drawn yet</p>
                    <p className="text-[10px] text-[#52525b] mt-0.5">Switch to Draw Mode above, then click points on the canvas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                    {polygons.map((poly) => (
                      <div
                        key={poly.id}
                        id={`poly-item-${poly.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-white/6 bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-150"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Color indicator dot */}
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: poly.color }}
                          />
                          <span className="text-xs font-semibold text-[#fafafa] truncate">
                            {poly.label || 'Annotation'}
                          </span>
                          <span className="text-[9px] text-[#52525b]">
                            ({poly.points.length} points)
                          </span>
                        </div>

                        <button
                          id={`delete-poly-${poly.id}`}
                          onClick={() => handlePolygonDelete(poly.id)}
                          className="p-1.5 rounded-lg text-[#52525b] hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                          aria-label="Delete annotation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Canvas Empty State Placeholder */
            <div className="flex-1 glass rounded-2xl p-12 shadow-xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-[#71717a] shadow-inner mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-[#fafafa] tracking-tight">
                No Scan Selected
              </h2>
              <p className="text-sm text-[#71717a] mt-1.5 max-w-sm">
                Select an existing scan from the side gallery or upload a new one to begin annotating region-of-interests.
              </p>
            </div>
          )}
        </section>
    </main>
  );
}
