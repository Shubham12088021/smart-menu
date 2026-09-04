import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Rotate3d, 
  Sparkles, 
  Flame, 
  Star, 
  RotateCcw, 
  Plus, 
  Minus,
  Info
} from 'lucide-react';
import { formatPrice, getImageUrl } from '../utils/constants';

/**
 * Image3D - Grand Interactive 3D Dish Showcase Modal
 * Uses React Portal to guarantee full-screen rendering without clipping.
 */
export default function Image3D({
  src,
  alt = '',
  item = null,
  className = '',
  imgClassName = '',
  maxTilt = 15,
  scale = 1.05,
  speed = 400,
  glare = true,
  perspective = 800,
  fallback = null,
  zoomable = true,
  itemName = '',
  onAddToCart = null,
}) {
  const containerRef = useRef(null);

  // Resolve absolute backend URL if relative path
  const finalSrc = getImageUrl(src);

  // Thumbnail hover states
  const [transform, setTransform] = useState('');
  const [glareStyle, setGlareStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  // 3D Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [rotX, setRotX] = useState(10);
  const [rotY, setRotY] = useState(-12);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const resolvedName = item?.name || itemName || alt || 'Dish Showcase';
  const resolvedPrice = item?.price ? formatPrice(item.price) : '';
  const resolvedDesc = item?.description || '';

  // Auto-rotate 3D stage
  useEffect(() => {
    let animId;
    if (modalOpen && isAutoRotate && !isDragging && !isFlipped) {
      const animate = () => {
        setRotY(prev => (prev + 0.45) % 360);
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [modalOpen, isAutoRotate, isDragging, isFlipped]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    if (modalOpen) {
      window.addEventListener('keydown', handleKey);
    }
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalOpen]);

  // Thumbnail mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    const tiltX = -mouseY * maxTilt;
    const tiltY = mouseX * maxTilt;

    setTransform(
      `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`
    );

    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlareStyle({
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, transparent 80%)`,
        opacity: 1,
      });
    }
  }, [maxTilt, scale, perspective, glare]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    setGlareStyle({ opacity: 0 });
  }, [perspective]);

  // 3D Modal Drag Controls
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleModalMouseMove = (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotY(prev => prev + deltaX * 0.5);
    setRotX(prev => Math.max(-55, Math.min(55, prev - deltaY * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setIsAutoRotate(false);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setRotY(prev => prev + deltaX * 0.6);
    setRotX(prev => Math.max(-55, Math.min(55, prev - deltaY * 0.6)));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const reset3D = () => {
    setRotX(10);
    setRotY(-12);
    setZoomLevel(1);
    setIsFlipped(false);
    setIsAutoRotate(true);
  };

  const openModal = (e) => {
    e.stopPropagation();
    if (zoomable && src) {
      reset3D();
      setModalOpen(true);
    }
  };

  if (!src) {
    return fallback || null;
  }

  // ── Render Fullscreen Portal Modal ────────────────────────
  const modalContent = modalOpen && typeof document !== 'undefined' ? (
    createPortal(
      <div
        className="dish-3d-portal-overlay"
        onClick={() => setModalOpen(false)}
        onMouseMove={handleModalMouseMove}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Main 3D Card Window */}
        <div 
          className="dish-3d-window"
          onClick={e => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="dish-3d-window-header">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="dish-3d-tag">
                <Sparkles className="w-4 h-4 text-amber-400" /> 3D Dish View
              </span>
              {item?.is_bestseller && (
                <span className="dish-3d-badge-pill bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-current" /> Bestseller
                </span>
              )}
              {item?.is_spicy && (
                <span className="dish-3d-badge-pill bg-red-500/20 text-red-300 border border-red-500/30">
                  <Flame className="w-3.5 h-3.5" /> Spicy
                </span>
              )}
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="dish-3d-close-btn"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3D Showcase Stage */}
          <div 
            className={`dish-3d-stage-container ${isDragging ? 'is-dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Ambient Lighting Pedestal */}
            <div className="dish-3d-ambient-glow" />

            {/* 3D Card Flipper */}
            <div
              className="dish-3d-flipper"
              style={{
                transform: `scale(${zoomLevel}) rotateX(${rotX}deg) rotateY(${rotY + (isFlipped ? 180 : 0)}deg)`,
                transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* ── CARD FRONT: High-Def 3D Dish ────── */}
              <div className="dish-3d-face dish-3d-front">
                <div className="dish-3d-img-container">
                  <img
                    src={finalSrc}
                    alt={resolvedName}
                    className="dish-3d-hero-img"
                    draggable={false}
                    onError={(e) => {
                      if (!e.currentTarget.dataset.fallback) {
                        e.currentTarget.dataset.fallback = 'true';
                        e.currentTarget.src = getImageUrl('/uploads/menu/6d1d869a_Paneer_tikka.webp');
                      }
                    }}
                  />

                  {/* Specular Glare Reflection */}
                  <div 
                    className="dish-3d-specular-glare"
                    style={{
                      background: `linear-gradient(${rotY + 45}deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.06) 45%, transparent 75%)`,
                    }}
                  />

                  {/* Glass rim shadow */}
                  <div className="dish-3d-inner-rim" />
                </div>

                {/* Floating Title Tag */}
                <div className="dish-3d-floating-title">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={item?.is_veg ?? true ? 'veg-dot' : 'nonveg-dot'} />
                    <span className="font-bold text-white text-lg tracking-wide truncate">
                      {resolvedName}
                    </span>
                  </div>
                  {resolvedPrice && (
                    <span className="font-black text-primary-400 text-lg whitespace-nowrap">
                      {resolvedPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* ── CARD BACK: Details & Ingredients ── */}
              <div className="dish-3d-face dish-3d-back">
                <div className="dish-3d-back-layout">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={item?.is_veg ?? true ? 'veg-dot' : 'nonveg-dot'} />
                        <h3 className="font-bold text-white text-xl">{resolvedName}</h3>
                      </div>
                      <p className="text-xs text-primary-400 font-semibold mt-0.5">Chef's Signature Recipe</p>
                    </div>
                    {resolvedPrice && (
                      <span className="text-2xl font-black text-primary-400">
                        {resolvedPrice}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4 my-auto py-3 overflow-y-auto">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Description & Taste Profile
                      </h4>
                      <p className="text-sm text-gray-200 leading-relaxed bg-white/5 p-3.5 rounded-2xl border border-white/5">
                        {resolvedDesc || 'Crafted with premium ingredients and aromatic spices for a rich, unforgettable taste experience.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Dietary</p>
                        <p className="text-sm font-bold text-white mt-1">
                          {item?.is_veg ?? true ? '🟢 Vegetarian' : '🔴 Non-Vegetarian'}
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">Spice Profile</p>
                        <p className="text-sm font-bold text-orange-400 mt-1">
                          {item?.is_spicy ? '🌶️ Spicy & Rich' : '🌱 Mild & Smooth'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {onAddToCart ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(item);
                        setModalOpen(false);
                      }}
                      className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2.5 rounded-2xl"
                    >
                      <Plus className="w-5 h-5" /> Add to Cart • {resolvedPrice}
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="btn-secondary w-full py-3 flex items-center justify-center gap-2 rounded-2xl text-sm"
                    >
                      <Rotate3d className="w-4 h-4" /> Return to 3D View
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Drag Hint */}
            <div className="dish-3d-drag-hint">
              <Rotate3d className="w-3.5 h-3.5 animate-pulse text-primary-400" />
              <span>Drag / Swipe anywhere to rotate in 3D</span>
            </div>
          </div>

          {/* Bottom Toolbar Controls */}
          <div className="dish-3d-window-footer">
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              {/* Auto Orbit Toggle */}
              <button
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`dish-3d-control-btn ${isAutoRotate ? 'active' : ''}`}
                title="Toggle continuous 3D rotation"
              >
                <Rotate3d className="w-4 h-4" />
                <span>{isAutoRotate ? '360° Auto Spin' : 'Start Auto Spin'}</span>
              </button>

              {/* Flip Card */}
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className={`dish-3d-control-btn ${isFlipped ? 'active' : ''}`}
                title="Flip to dish info"
              >
                <Info className="w-4 h-4" />
                <span>{isFlipped ? 'Show 3D View' : 'Dish Details'}</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.15))}
                  className="dish-3d-icon-btn"
                  title="Zoom Out"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-bold text-gray-300 px-1.5">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.15))}
                  className="dish-3d-icon-btn"
                  title="Zoom In"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reset Angle */}
              <button
                onClick={reset3D}
                className="dish-3d-control-btn"
                title="Reset 3D camera"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  if (!src) {
    return fallback || null;
  }

  return (
    <>
      {/* ── Thumbnail View ─────────────────────────────────── */}
      <div
        ref={containerRef}
        className={`image-3d-container ${zoomable ? 'image-3d-zoomable' : ''} ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={openModal}
        style={{ perspective: `${perspective}px` }}
        title={zoomable ? "Click to open 3D Showcase" : ""}
      >
        <div
          className="image-3d-inner"
          style={{
            transform: isHovered ? transform : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
            transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
          }}
        >
          <img
            src={finalSrc}
            alt={alt}
            className={`image-3d-img ${imgClassName}`}
            draggable={false}
            onError={(e) => {
              if (!e.currentTarget.dataset.fallback) {
                e.currentTarget.dataset.fallback = 'true';
                e.currentTarget.src = getImageUrl('/uploads/menu/6d1d869a_Paneer_tikka.webp');
              }
            }}
          />

          {glare && (
            <div
              className="image-3d-glare"
              style={{
                ...glareStyle,
                transition: `opacity ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
              }}
            />
          )}

          <div
            className="image-3d-shadow-ring"
            style={{
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${speed}ms ease`,
            }}
          />

          {zoomable && (
            <div
              className="image-3d-3d-badge"
              style={{
                opacity: isHovered ? 1 : 0.9,
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              <Rotate3d className="w-3.5 h-3.5 text-primary-400" />
              <span>3D</span>
            </div>
          )}
        </div>
      </div>

      {/* Rendered Portal Modal */}
      {modalContent}
    </>
  );
}
