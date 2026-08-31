// ── Menu Templates ───────────────────────────────────────────

export const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean cards with rounded corners and subtle shadows',
    preview: '🎨',
    className: 'template-modern',
    colors: { bg: '#ffffff', text: '#111827', accent: '#f97316' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple typography with generous whitespace',
    preview: '✨',
    className: 'template-minimal',
    colors: { bg: '#fafafa', text: '#374151', accent: '#6b7280' },
  },
  {
    id: 'cafe',
    name: 'Café',
    description: 'Warm, friendly layout with earthy tones',
    preview: '☕',
    className: 'template-cafe',
    colors: { bg: '#fffbeb', text: '#78350f', accent: '#d97706' },
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Elegant dark theme with gold accents',
    preview: '👑',
    className: 'template-luxury',
    colors: { bg: '#030712', text: '#f3f4f6', accent: '#fbbf24' },
  },
  {
    id: 'streetfood',
    name: 'Street Food',
    description: 'Bold, colorful and energetic design',
    preview: '🔥',
    className: 'template-streetfood',
    colors: { bg: '#fff7ed', text: '#1f2937', accent: '#ea580c' },
  },
];

// ── Font Options ─────────────────────────────────────────────

export const FONTS = [
  { id: 'Inter', name: 'Inter', style: 'Modern Sans-serif' },
  { id: 'Outfit', name: 'Outfit', style: 'Geometric Sans-serif' },
  { id: 'Poppins', name: 'Poppins', style: 'Friendly Sans-serif' },
  { id: 'Playfair Display', name: 'Playfair Display', style: 'Elegant Serif' },
];

// ── Layout Options ───────────────────────────────────────────

export const LAYOUTS = [
  { id: 'compact', name: 'Compact', description: 'Dense layout, more items visible' },
  { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing and readability' },
  { id: 'image-focused', name: 'Image Focused', description: 'Large images, visual emphasis' },
];

// ── Order Statuses ───────────────────────────────────────────

export const ORDER_STATUSES = [
  { id: 'pending', name: 'Pending', color: 'yellow', next: 'preparing' },
  { id: 'preparing', name: 'Preparing', color: 'blue', next: 'ready' },
  { id: 'ready', name: 'Ready', color: 'green', next: 'completed' },
  { id: 'completed', name: 'Completed', color: 'gray', next: null },
  { id: 'cancelled', name: 'Cancelled', color: 'red', next: null },
];

// ── Currency Formatter ───────────────────────────────────────

export const formatPrice = (price) => {
  return `₹${Number(price).toFixed(0)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
