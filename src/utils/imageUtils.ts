/**
 * Image utilities for handling problematic image URLs
 */

/**
 * Check if an image URL is safe to load
 * Filters out Facebook CDN URLs that cause 403 errors
 */
export const isSafeImageUrl = (url?: string): boolean => {
  if (!url) return false;
  
  // List of problematic domains that cause CORS or 403 errors
  const problematicDomains = [
    'fbcdn.net',
    'facebook.com', 
    'scontent-',
    'graph.facebook.com'
  ];
  
  return !problematicDomains.some(domain => url.includes(domain));
};

/**
 * Get a safe image URL or return undefined if unsafe
 */
export const getSafeImageUrl = (url?: string): string | undefined => {
  return isSafeImageUrl(url) ? url : undefined;
};

/**
 * Get user initials from name for avatar fallback
 */
export const getUserInitials = (name?: string): string => {
  if (!name) return 'م';
  
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Generate a placeholder avatar URL with initials
 */
export const generateAvatarPlaceholder = (name?: string, size: number = 100): string => {
  const initials = getUserInitials(name);
  const backgroundColor = '3B82F6'; // Blue background
  const textColor = 'FFFFFF'; // White text
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${backgroundColor}&color=${textColor}&font-size=0.5&bold=true`;
};
