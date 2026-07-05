'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Circle } from 'react-konva';
import { AlertCircle, PenTool, MousePointer, Trash2, CheckCircle2 } from 'lucide-react';
import type { AnnotationCanvasProps, Point } from '@/src/interfaces';
import { cn } from '@/lib/utils';

// Helper to generate light, transparent hex colors with alpha for overlay
const POLYGON_ALPHA = '40'; // 25% opacity in hex: 40 = 25% of 255 (0.25 * 255 = 64 = 0x40)
const POLYGON_STROKE_ALPHA = 'cc'; // 80% opacity: cc = 0.8 * 255 = 204 = 0xcc

export default function AnnotationCanvas({
  image,
  polygons,
  onPolygonSave,
  onPolygonDelete,
}: AnnotationCanvasProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const [isDrawMode, setIsDrawMode] = useState(true);
  const [newPoints, setNewPoints] = useState<Point[]>([]);
  const [hoveredPolygonId, setHoveredPolygonId] = useState<number | null>(null);
  const [polygonLabel, setPolygonLabel] = useState('');
  const [polygonColor, setPolygonColor] = useState('#7c3aed');

  const containerRef = useRef<HTMLDivElement>(null);

  // Colors preset
  const colorPresets = [
    { name: 'Purple', value: '#7c3aed' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Yellow', value: '#eab308' },
  ];

  // Load image
  useEffect(() => {
    if (!image) return;
    const img = new Image();
    img.src = image.image;
    img.crossOrigin = 'anonymous'; // Avoid canvas pollution if using Vercel/Cloudinary
    img.onload = () => {
      setImageObj(img);
    };
    // Clear draft on image change
    setNewPoints([]);
  }, [image]);

  // Handle resizing and scaling of the canvas
  useEffect(() => {
    if (!imageObj || !containerRef.current) return;

    const updateScale = () => {
      const containerWidth = containerRef.current?.offsetWidth ?? 800;
      // Fit to container width, keep aspect ratio bounded
      const maxDisplayWidth = Math.min(containerWidth, 900);
      const maxDisplayHeight = 550;

      const s = Math.min(
        maxDisplayWidth / imageObj.naturalWidth,
        maxDisplayHeight / imageObj.naturalHeight
      );

      setScale(s);
      setCanvasSize({
        width: imageObj.naturalWidth * s,
        height: imageObj.naturalHeight * s,
      });
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageObj]);

  // Close polygon keyboard shortcut (Enter)
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === 'Enter' && newPoints.length >= 3 && isDrawMode) {
        e.preventDefault();
        savePolygon();
      } else if (e.key === 'Escape') {
        setNewPoints([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [newPoints, isDrawMode]);

  // Trigger point addition on canvas click
  const handleCanvasClick = (e: any) => {
    if (!isDrawMode || !imageObj) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    if (!pointerPosition) return;

    // Convert coordinates to relative (natural image dimensions)
    const relPoint: Point = {
      x: pointerPosition.x / scale,
      y: pointerPosition.y / scale,
    };

    // If clicking near the first point and we have at least 3 points, close it
    if (newPoints.length >= 3) {
      const first = newPoints[0];
      const dist = Math.hypot((relPoint.x - first.x) * scale, (relPoint.y - first.y) * scale);
      if (dist < 10) {
        savePolygon();
        return;
      }
    }

    setNewPoints((prev) => [...prev, relPoint]);
  };

  const savePolygon = () => {
    if (newPoints.length < 3) return;

    // Call save callback with the payload custom options
    // Wait, the interface only specifies points. But let's check if the API supports labels/colors.
    // Yes! in lib/api.ts: createPolygon: (imageId, payload: { points: Point[], label?: string, color?: string })
    // But the canvas props interface is: onPolygonSave: (points: Point[]) => void.
    // To support customizing label/color on save, we will pass them along.
    // Wait, since onPolygonSave only takes points in the interface:
    // interface AnnotationCanvasProps { onPolygonSave: (points: Point[]) => void }
    // Let's check how the component was defined in CLAUDE.md:
    // interface AnnotationCanvasProps { onPolygonSave: (points: Point[]) => void }
    // How can we customize label/color then? We can save it by passing custom fields inside a modified store handler or modify the callback in app/annotate/page.tsx.
    // Let's pass points to onPolygonSave. We can store the current label/color in state and pass it in a custom way, or we can update the interface.
    // Since the interface is already loaded in src/interfaces, we can just use it. Let's see: we can pass points, but how will page save color?
    // Let's check how onPolygonSave is wired. We can pass a custom function or let page fetch it.
    // Actually, we can add optional parameters or use a custom handler.
    // Let's pass it anyway: (points, label, color) or just change the props interface if needed, but to respect the interface strictly:
    // Let's pass an object or let onPolygonSave handle the save.
    // Let's pass the points, and we can store label and color directly on a form or pass them as part of a custom call inside page.tsx.
    // Let's make a wrapper in page.tsx that reads current active values.
    // Let's do that! We'll just call onPolygonSave(newPoints) and let page.tsx handle it, or we can cast it if needed.
    onPolygonSave(newPoints);
    setNewPoints([]);
  };

  // Convert Point[] to Konva flat array [x1, y1, x2, y2, ...]
  const getFlatPoints = (points: Point[]) => {
    return points.flatMap((p) => [p.x * scale, p.y * scale]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111118]/80 p-3 rounded-xl border border-white/8 backdrop-blur-md">
        {/* Draw Mode Switch */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsDrawMode(true);
              setNewPoints([]);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              isDrawMode
                ? 'bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/25'
                : 'text-[#71717a] hover:text-[#fafafa] hover:bg-white/6'
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
            Draw Mode
          </button>
          <button
            onClick={() => {
              setIsDrawMode(false);
              setNewPoints([]);
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
              !isDrawMode
                ? 'bg-white/10 text-white'
                : 'text-[#71717a] hover:text-[#fafafa] hover:bg-white/6'
            )}
          >
            <MousePointer className="w-3.5 h-3.5" />
            Select Mode
          </button>
        </div>

        {/* Info panel when drawing */}
        {isDrawMode && (
          <div className="text-[11px] text-[#71717a] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#8b5cf6]" />
            {newPoints.length === 0 ? (
              <span>Click canvas to start drawing a shape</span>
            ) : newPoints.length < 3 ? (
              <span>Add at least {3 - newPoints.length} more point(s)</span>
            ) : (
              <span>Click first point or press Enter to close shape</span>
            )}
          </div>
        )}

        {/* Clear draft option */}
        {newPoints.length > 0 && (
          <button
            onClick={() => setNewPoints([])}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-150"
          >
            Clear Draft
          </button>
        )}
      </div>

      {/* ── Canvas Container ── */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-2xl border border-white/8 overflow-hidden shadow-2xl flex items-center justify-center min-h-[400px]"
        style={{
          cursor: isDrawMode ? 'crosshair' : 'default',
        }}
      >
        {!imageObj ? (
          <div className="flex flex-col items-center gap-2 text-sm text-[#71717a]">
            <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
            <span>Loading image canvas...</span>
          </div>
        ) : (
          <Stage
            width={canvasSize.width}
            height={canvasSize.height}
            onClick={handleCanvasClick}
          >
            <Layer>
              {/* Image */}
              <KonvaImage
                image={imageObj}
                width={canvasSize.width}
                height={canvasSize.height}
              />

              {/* Saved Polygons */}
              {polygons.map((poly) => {
                const isHovered = hoveredPolygonId === poly.id;
                // Add opacity to fill color
                const fillColor = `${poly.color ?? '#7c3aed'}${POLYGON_ALPHA}`;
                const strokeColor = `${poly.color ?? '#7c3aed'}${POLYGON_STROKE_ALPHA}`;

                return (
                  <Line
                    key={poly.id}
                    points={getFlatPoints(poly.points)}
                    closed
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    onMouseEnter={() => !isDrawMode && setHoveredPolygonId(poly.id)}
                    onMouseLeave={() => setHoveredPolygonId(null)}
                    onClick={() => {
                      if (!isDrawMode) {
                        if (confirm(`Delete polygon "${poly.label || 'Unnamed'}"?`)) {
                          onPolygonDelete(poly.id);
                        }
                      }
                    }}
                    listening={!isDrawMode}
                  />
                );
              })}

              {/* Current Active Draft Polygon */}
              {isDrawMode && newPoints.length > 0 && (
                <>
                  <Line
                    points={getFlatPoints(newPoints)}
                    closed={false}
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                  />
                  {newPoints.map((pt, index) => {
                    const isFirst = index === 0;
                    return (
                      <Circle
                        key={index}
                        x={pt.x * scale}
                        y={pt.y * scale}
                        radius={isFirst ? 5.5 : 4}
                        fill={isFirst ? '#22c55e' : '#8b5cf6'}
                        stroke="#fafafa"
                        strokeWidth={1}
                        className="cursor-pointer"
                      />
                    );
                  })}
                </>
              )}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

// Inline loading indicator for dynamic imports
function Loader2({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
