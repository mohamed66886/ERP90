// Debug utilities for development
export const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.DEV) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

export const debugError = (message: string, error?: unknown) => {
  if (import.meta.env.DEV) {
    console.error(`[DEBUG ERROR] ${message}`, error || '');
  }
};

export const debugTime = (label: string) => {
  if (import.meta.env.DEV) {
    console.time(`[DEBUG TIME] ${label}`);
  }
};

export const debugTimeEnd = (label: string) => {
  if (import.meta.env.DEV) {
    console.timeEnd(`[DEBUG TIME] ${label}`);
  }
};
