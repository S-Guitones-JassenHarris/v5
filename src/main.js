// src/main.js

import {
  initAppState,
  hydrateAppState,
  getState,
  subscribe,
  dispatch,
} from './core/app-state.js';
import { renderAppShell } from './ui/layout/app-shell.js';
import { loadAllCatalogs } from './catalog/catalog-service.js';

const STORAGE_KEY = 'v5-quote-app-state';

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('app');
  if (!root) {
    console.error('#app root not found');
    return;
  }

  // Try to hydrate from localStorage first
  const persisted = loadPersistedState();
  if (persisted) {
    hydrateAppState(persisted);
  } else {
    initAppState();
  }

  const render = () => {
    // Snapshot current focused field for smooth typing
    let focusInfo = null;
    const active = document.activeElement;
    if (active && active.dataset && active.dataset.fieldId) {
      focusInfo = {
        fieldId: active.dataset.fieldId,
        selectionStart: active.selectionStart,
        selectionEnd: active.selectionEnd,
      };
    }

    // Full render
    renderAppShell(root, {
      state: getState(),
      dispatch,
    });

    // Restore focus
    if (focusInfo && focusInfo.fieldId) {
      const newField = root.querySelector(
        `[data-field-id="${focusInfo.fieldId}"]`
      );
      if (newField) {
        newField.focus();
        try {
          if (
            typeof focusInfo.selectionStart === 'number' &&
            typeof focusInfo.selectionEnd === 'number'
          ) {
            newField.setSelectionRange(
              focusInfo.selectionStart,
              focusInfo.selectionEnd
            );
          }
        } catch {
          // Some elements (e.g., select) may not support setSelectionRange
        }
      }
    }
  };

  // Initial render & subscriptions
  render();
  subscribe(render);

  // Subscribe to persist state on every change
  subscribe((s) => {
    savePersistedState(s);
  });

  // Load catalogs asynchronously, then re-render once
  try {
    await loadAllCatalogs();
    render();
  } catch (err) {
    console.error('Failed to load catalogs:', err);
  }
});

/**
 * Load state snapshot from localStorage.
 */
function loadPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (err) {
    console.warn('Failed to load persisted state:', err);
    return null;
  }
}

/**
 * Save current state snapshot to localStorage.
 */
function savePersistedState(state) {
  try {
    const snapshot = {
      version: state.version,
      tabs: state.tabs,
      activeTabId: state.activeTabId,
    };
    const raw = JSON.stringify(snapshot);
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch (err) {
    console.warn('Failed to save state:', err);
  }
}
