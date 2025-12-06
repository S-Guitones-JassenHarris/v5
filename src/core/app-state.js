// src/core/app-state.js

let state = null;
let listeners = [];
let nextTabNumber = 1;

function createTab(id, num) {
  return {
    id,
    label: `Quote ${num}`,      // internal tab label
    quoteName: '',              // user-defined visible quote name
    serviceType: null,          // one of service type IDs or null
    inputs: {},                 // live values used in the form
    committedInputs: {},        // last committed values used for sidebar/calcs
    isDirty: false,             // true when live inputs differ from committed
    lastCommitError: null,      // string or null
  };
}

function createInitialState() {
  nextTabNumber = 1;
  const firstId = `tab-${nextTabNumber}`;
  const firstTab = createTab(firstId, nextTabNumber);
  nextTabNumber++;

  return {
    version: '0.6', // bumped when we added persistence/hydration
    tabs: [firstTab],
    activeTabId: firstId,
  };
}

/**
 * Initialize state if not already initialized (no persistence used).
 */
export function initAppState() {
  if (!state) {
    state = createInitialState();
  }
}

/**
 * Hydrate state from a previously saved snapshot.
 * If snapshot is invalid, falls back to a fresh initial state.
 */
export function hydrateAppState(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    state = createInitialState();
    return;
  }

  const tabs = Array.isArray(snapshot.tabs) ? snapshot.tabs : [];
  if (tabs.length === 0) {
    state = createInitialState();
    return;
  }

  // Rebuild tabs with defaults
  const rebuiltTabs = tabs.map((t, index) => {
    const num = index + 1;
    const id = typeof t.id === 'string' && t.id.trim() ? t.id.trim() : `tab-${num}`;

    const base = createTab(id, num);

    return {
      ...base,
      label: typeof t.label === 'string' && t.label.trim()
        ? t.label.trim()
        : `Quote ${num}`,
      quoteName: typeof t.quoteName === 'string' ? t.quoteName : '',
      serviceType: t.serviceType || null,
      inputs: { ...(t.inputs || {}) },
      committedInputs: { ...(t.committedInputs || t.inputs || {}) },
      isDirty: !!t.isDirty,
      lastCommitError: null, // don't resurrect old errors
    };
  });

  // Determine active tab
  let activeTabId = snapshot.activeTabId;
  if (
    !activeTabId ||
    !rebuiltTabs.some((t) => t.id === activeTabId)
  ) {
    activeTabId = rebuiltTabs[0].id;
  }

  state = {
    version: snapshot.version || '0.6',
    tabs: rebuiltTabs,
    activeTabId,
  };

  // Recompute nextTabNumber based on tab ids
  let maxNum = 0;
  rebuiltTabs.forEach((t, index) => {
    const m = /tab-(\d+)/.exec(t.id);
    const n = m ? parseInt(m[1], 10) : index + 1;
    if (Number.isFinite(n) && n > maxNum) {
      maxNum = n;
    }
  });
  nextTabNumber = maxNum + 1;
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify() {
  listeners.forEach((l) => l(state));
}

export function dispatch(action) {
  switch (action.type) {
    case 'ADD_TAB': {
      const id = `tab-${nextTabNumber}`;
      const tab = createTab(id, nextTabNumber);
      nextTabNumber++;

      state = {
        ...state,
        tabs: [...state.tabs, tab],
        activeTabId: id,
      };
      break;
    }

    case 'REMOVE_TAB': {
      const { tabId } = action.payload || {};
      const tabs = state.tabs;

      // If only one tab, treat as "clear all" and re-init
      if (!tabs || tabs.length <= 1) {
        state = createInitialState();
        break;
      }

      const index = tabs.findIndex((t) => t.id === tabId);
      if (index === -1) {
        break;
      }

      const newTabs = tabs.filter((t) => t.id !== tabId);

      let newActiveId = state.activeTabId;
      if (state.activeTabId === tabId) {
        const fallbackIndex = index > 0 ? index - 1 : 0;
        newActiveId = newTabs[fallbackIndex]?.id ?? newTabs[0]?.id;
      }

      state = {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveId,
      };
      break;
    }

    case 'SET_ACTIVE_TAB': {
      const { tabId } = action.payload || {};
      state = { ...state, activeTabId: tabId };
      break;
    }

    case 'SET_SERVICE_TYPE': {
      const { tabId, serviceTypeId } = action.payload || {};
      state = {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId
            ? {
                ...t,
                serviceType: serviceTypeId,
                inputs: {},
                committedInputs: {},
                isDirty: false,
                lastCommitError: null,
              }
            : t
        ),
      };
      break;
    }

    case 'SET_QUOTE_NAME': {
      const { tabId, name } = action.payload || {};
      state = {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, quoteName: name || '' } : t
        ),
      };
      break;
    }

    case 'UPDATE_FIELD': {
      const { tabId, fieldId, value } = action.payload || {};
      state = {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            inputs: {
              ...t.inputs,
              [fieldId]: value,
            },
            isDirty: true,
          };
        }),
      };
      break;
    }

    case 'COMMIT_INPUTS': {
      const { tabId } = action.payload || {};
      state = {
        ...state,
        tabs: state.tabs.map((t) => {
          if (t.id !== tabId) return t;
          return {
            ...t,
            committedInputs: { ...(t.inputs || {}) },
            isDirty: false,
            lastCommitError: null,
          };
        }),
      };
      break;
    }

    case 'SET_TAB_ERROR': {
      const { tabId, message } = action.payload || {};
      state = {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, lastCommitError: message || null } : t
        ),
      };
      break;
    }

    case 'IMPORT_QUOTES': {
      const { tabs: importedTabs } = action.payload || {};
      if (!Array.isArray(importedTabs) || importedTabs.length === 0) {
        break;
      }

      // Reset counter and rebuild tabs
      nextTabNumber = 1;

      const newTabs = importedTabs.map((srcTab, index) => {
        const id = `tab-${nextTabNumber}`;
        const base = createTab(id, nextTabNumber);
        nextTabNumber++;

        return {
          ...base,
          label: srcTab.label || `Quote ${index + 1}`,
          quoteName: typeof srcTab.quoteName === 'string' ? srcTab.quoteName : '',
          serviceType: srcTab.serviceType || null,
          inputs: { ...(srcTab.inputs || {}) },
          committedInputs: { ...(srcTab.inputs || {}) },
          isDirty: false,
          lastCommitError: null,
        };
      });

      state = {
        ...state,
        tabs: newTabs,
        activeTabId: newTabs[0].id,
      };
      break;
    }

    case 'CLEAR_ALL_QUOTES': {
      state = createInitialState();
      break;
    }

    default:
      console.warn('Unknown action type:', action.type);
  }

  notify();
}
