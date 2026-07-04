import { create } from 'zustand';
import { annotateApi } from '@/lib/api';
import type { AnnotateStore, AnnotationImage } from '@/src/interfaces';

const useAnnotateStore = create<AnnotateStore>((set) => ({
  // ─── State ──────────────────────────────────────────────────────────────────
  images: [],
  activeImage: null,
  polygons: [],

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Set the currently active image in the annotation canvas.
   * Also clears polygons until fetchPolygons is called.
   */
  setActiveImage: (image: AnnotationImage) =>
    set({ activeImage: image, polygons: [] }),

  /**
   * Fetch all uploaded images from the Django backend.
   */
  fetchImages: async () => {
    try {
      const { data } = await annotateApi.getImages();
      set({ images: data });
    } catch (error) {
      console.error('[annotateStore] fetchImages error:', error);
      set({ images: [] });
    }
  },

  /**
   * Fetch all polygons for the given image ID.
   */
  fetchPolygons: async (imageId: number) => {
    try {
      const { data } = await annotateApi.getPolygons(imageId);
      set({ polygons: data });
    } catch (error) {
      console.error('[annotateStore] fetchPolygons error:', error);
      set({ polygons: [] });
    }
  },
}));

export default useAnnotateStore;
