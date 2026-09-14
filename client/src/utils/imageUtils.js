/**
 * Central image utility for Worklyn AI
 * Handles static assets, local/production backend uploads, and fallback placeholders.
 */

// Default fallbacks
export const DEFAULT_AVATAR = (name = 'User') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=F4510B&color=fff`;

export const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200';

export const DEFAULT_HERO_BANNER = '';

/**
 * Resolves full image URL for static assets and backend uploads.
 * Works seamlessly in both local development (Vite proxy) and production (Vercel + Backend host).
 */
export const getImageUrl = (imagePath, fallback = '') => {
  if (!imagePath || typeof imagePath !== 'string') {
    return fallback;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) return fallback;

  // Blob and Data URLs (local previews during file upload)
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Already absolute URLs (Unsplash, UI-avatars, Cloudinary, S3, external)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Handle uploaded files starting with /uploads or uploads
  if (trimmed.startsWith('/uploads') || trimmed.startsWith('uploads')) {
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

    // In production, prepend the backend host from VITE_API_URL if configured
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      const backendBase = apiUrl.replace(/\/api\/?$/, '');
      return `${backendBase}${cleanPath}`;
    }

    // In development, Vite proxy forwards /uploads to 127.0.0.1:5000
    return cleanPath;
  }

  // Relative public assets like /logo.png, /favicon.svg
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed}`;
};

/**
 * Image error handler to safely replace broken image links with a fallback.
 */
export const handleImageError = (e, fallback) => {
  if (!e || !e.target) return;
  if (e.target.dataset.hasFailed) return;
  e.target.dataset.hasFailed = 'true';
  e.target.src = fallback || DEFAULT_AVATAR('User');
};
