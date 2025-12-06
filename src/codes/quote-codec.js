// src/codes/quote-codec.js

/**
 * Build a plain export payload from the current app state.
 * Only uses COMMITTED inputs per tab.
 */
export function buildExportPayload(state) {
  const tabs = state.tabs || [];

  return {
    formatVersion: 'v1',
    appVersion: state.version || '0.0',
    createdAt: new Date().toISOString(),
    tabs: tabs.map((t) => ({
      label: t.label,
      quoteName: t.quoteName || '',
      serviceType: t.serviceType,
      inputs: { ...(t.committedInputs || {}) },
    })),
  };
}

/**
 * Encode the payload as a pretty JSON string.
 */
export function encodeExportPayload(payload) {
  return JSON.stringify(payload, null, 2);
}

/**
 * Parse JSON text into a payload object.
 * Throws if invalid JSON.
 */
export function parseImportPayload(text) {
  const obj = JSON.parse(text); // may throw

  if (!obj || typeof obj !== 'object') {
    throw new Error('Invalid payload structure');
  }

  if (!Array.isArray(obj.tabs) || obj.tabs.length === 0) {
    throw new Error('Payload does not contain any tabs');
  }

  return obj;
}
