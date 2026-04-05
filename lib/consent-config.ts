// Global kill-switch for consent event collection.
// Keep this `false` to stop writing consent events to DB without removing code.
export const isConsentTrackingEnabled = false;

// Server-side guard used by API routes.
export const isServerConsentTrackingEnabled = false;
