/**
 * Utility function to merge class names
 * Simple implementation without clsx/tailwind-merge since we're not using Tailwind
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}



