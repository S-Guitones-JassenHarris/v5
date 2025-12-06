// src/ui/layout/app-shell.js

import { createHeader } from './header.js';
import { createTabsBar } from './tabs-bar.js';
import { createMainPane } from './main-pane.js';
import { createSidebarPane } from './sidebar-pane.js';

import {
  calculateQuoteForService,
  getFieldsForService,
} from '../../service-types/index.js';
import { getCatalog } from '../../catalog/catalog-service.js';
import { validateField } from '../../validation/field-validation.js';
import {
  buildExportPayload,
  encodeExportPayload,
  parseImportPayload,
} from '../../codes/quote-codec.js';
import { openExportModal } from '../modal/export-modal.js';
import { openImportModal } from '../modal/import-modal.js';

import {
  generateQuotesPdf,
  DEFAULT_APP_INFO,
} from '../../pdf/pdf-service.js';

// ----------------------
// Main render function
// ----------------------

export function renderAppShell(rootElement, { state, dispatch }) {
  rootElement.innerHTML = '';

  const shell = document.createElement('div');
  shell.className = 'app-shell';

  // Catalogs (used for active tab, global summary, and PDF)
  const catalogs = {
    materials: getCatalog('materials'),
    machines: getCatalog('machines'),
  };

  const handleExport = () => {
    const check = checkExportable(state);
    if (!check.ok) {
      window.alert(check.message);
      return;
    }

    const payload = buildExportPayload(state);
    const jsonText = encodeExportPayload(payload);

    openExportModal(jsonText);
  };

  const handleImport = () => {
    const confirmErase = window.confirm(
      'Importing will erase all current quotes and replace them with the imported ones. Continue?'
    );
    if (!confirmErase) return;

    openImportModal((text) => {
      let payload;
      try {
        payload = parseImportPayload(text);
      } catch (err) {
        console.error('Failed to parse import payload:', err);
        window.alert(
          'The JSON could not be parsed. Please make sure you pasted a valid export.'
        );
        return;
      }

      if (!payload || !Array.isArray(payload.tabs) || payload.tabs.length === 0) {
        window.alert('The JSON does not contain any tabs to import.');
        return;
      }

      dispatch({
        type: 'IMPORT_QUOTES',
        payload: {
          tabs: payload.tabs,
        },
      });
    });
  };

  const handlePdfClick = async () => {
    try {
      // Reuse the same guard as export: all quotes must be valid & committed
      const check = checkExportable(state);
      if (!check.ok) {
        window.alert(check.message);
        return;
      }

      const quotesForPdf = collectQuotesForPdf(state, catalogs);

      if (!quotesForPdf || !quotesForPdf.length) {
        alert('No committed quotes to export to PDF.');
        return;
      }

      await generateQuotesPdf({
        quotes: quotesForPdf,
        appInfo: {
          ...DEFAULT_APP_INFO,
          companyName: 'Your 3D Studio Name',
          companyAddress: 'Your Address Line 1\nYour City, Philippines',
          companyContact: 'Phone: 09XX-XXX-XXXX\nEmail: quotes@example.com',
          appVersion: 'V5.0.0',
          preparedBy: 'Prepared by: Your Name',
        },
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Unable to generate PDF. Please check the console for details.');
    }
  };

  const header = createHeader({
    onClearAll: () => dispatch({ type: 'CLEAR_ALL_QUOTES' }),
    onExport: handleExport,
    onImport: handleImport,
    onPdfClick: handlePdfClick,
    onDocumentation: () => {
      window.open('docs/documentation.txt', '_blank');
    },
    onChangelog: () => {
      window.open('docs/changelog.txt', '_blank');
    },
  });

  const body = document.createElement('div');
  body.className = 'app-body';

  const main = document.createElement('div');
  main.className = 'app-main';

  const activeTab =
    state.tabs.find((t) => t.id === state.activeTabId) || null;

  const tabsBar = createTabsBar({
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    onTabClick: (tabId) =>
      dispatch({ type: 'SET_ACTIVE_TAB', payload: { tabId } }),
    onAddTabClick: () => dispatch({ type: 'ADD_TAB' }),
    onCloseTab: (tabId) =>
      dispatch({ type: 'REMOVE_TAB', payload: { tabId } }),
  });

  const mainPane = createMainPane({
    activeTab,
    onServiceTypeSelected: (serviceTypeId) => {
      if (!activeTab) return;
      dispatch({
        type: 'SET_SERVICE_TYPE',
        payload: { tabId: activeTab.id, serviceTypeId },
      });
    },
    onFieldChange: (fieldId, value) => {
      if (!activeTab) return;
      dispatch({
        type: 'UPDATE_FIELD',
        payload: {
          tabId: activeTab.id,
          fieldId,
          value,
        },
      });
    },
  });

  // Active tab quote result based on COMMITTED inputs only
  let quoteResult = null;
  if (activeTab && activeTab.serviceType) {
    const committedInputs = activeTab.committedInputs || {};
    quoteResult = calculateQuoteForService(
      activeTab.serviceType,
      committedInputs,
      catalogs
    );
  }

  // Global summary across all tabs (selling price per quote)
  const globalSummary = computeGlobalSummary(state, catalogs);

  const sidebar = createSidebarPane({
    activeTab,
    quoteResult,
    globalSummary,
    onUpdateSummary: () => {
      if (!activeTab || !activeTab.serviceType) return;

      const fields = getFieldsForService(activeTab.serviceType);
      const inputs = activeTab.inputs || {};

      let hasError = false;
      for (const field of fields) {
        const value =
          Object.prototype.hasOwnProperty.call(inputs, field.id) &&
          inputs[field.id] !== undefined
            ? inputs[field.id]
            : '';
        const { isValid } = validateField(field, value);
        if (!isValid) {
          hasError = true;
          break;
        }
      }

      if (hasError) {
        dispatch({
          type: 'SET_TAB_ERROR',
          payload: {
            tabId: activeTab.id,
            message: 'Please check inputs, some are not valid.',
          },
        });
        return;
      }

      dispatch({
        type: 'COMMIT_INPUTS',
        payload: { tabId: activeTab.id },
      });
    },
  });

  main.appendChild(tabsBar);
  main.appendChild(mainPane);

  body.appendChild(main);
  body.appendChild(sidebar);

  shell.appendChild(header);
  shell.appendChild(body);

  rootElement.appendChild(shell);
}

/**
 * Check if the current state is eligible for export/PDF:
 * - Every tab must have a serviceType
 * - No tab is dirty (all committed)
 * - All committed inputs are valid per service field definitions
 */
function checkExportable(state) {
  const tabs = state.tabs || [];

  if (!tabs.length) {
    return {
      ok: false,
      message: 'There are no quotes to export.',
    };
  }

  for (const tab of tabs) {
    if (!tab.serviceType) {
      return {
        ok: false,
        message: `Quote "${tab.label}" has no service type selected. Please select a service and update summary before exporting.`,
      };
    }

    if (tab.isDirty) {
      return {
        ok: false,
        message: `Quote "${tab.label}" has uncommitted changes. Please click "Update summary" first.`,
      };
    }

    const fields = getFieldsForService(tab.serviceType);
    const committedInputs = tab.committedInputs || {};

    for (const field of fields) {
      const value =
        Object.prototype.hasOwnProperty.call(committedInputs, field.id) &&
        committedInputs[field.id] !== undefined
          ? committedInputs[field.id]
          : '';
      const { isValid } = validateField(field, value);
      if (!isValid) {
        return {
          ok: false,
          message: `Quote "${tab.label}" has invalid or incomplete committed inputs. Please fix them and update summary before exporting.`,
        };
      }
    }
  }

  return { ok: true, message: '' };
}

/**
 * Compute global summary across all tabs:
 * Selling price per quote:
 * - If rushFinalSellPrice is present, use that
 * - Else use finalSellPrice
 * - Else fall back to total
 * Labels use quoteName if present, otherwise the tab label.
 */
function computeGlobalSummary(state, catalogs) {
  const tabs = state.tabs || [];
  const items = [];

  tabs.forEach((tab) => {
    if (!tab.serviceType) return;

    const committedInputs = tab.committedInputs || {};
    const result = calculateQuoteForService(
      tab.serviceType,
      committedInputs,
      catalogs
    );

    const meta = result && result.meta ? result.meta : {};

    let amount = 0;

    if (meta && meta.rushFinalSellPrice != null) {
      const v = Number(meta.rushFinalSellPrice);
      if (Number.isFinite(v) && !Number.isNaN(v)) {
        amount = v;
      }
    } else if (meta && meta.finalSellPrice != null) {
      const v = Number(meta.finalSellPrice);
      if (Number.isFinite(v) && !Number.isNaN(v)) {
        amount = v;
      }
    } else {
      const fallback = Number(result && result.total);
      if (Number.isFinite(fallback) && !Number.isNaN(fallback)) {
        amount = fallback;
      }
    }

    const committedName =
      tab.committedInputs && tab.committedInputs.quoteName;
    const displayName =
      (committedName && String(committedName).trim()) ||
      (tab.quoteName && tab.quoteName.trim()) ||
      tab.label;

    items.push({
      tabId: tab.id,
      label: displayName,
      amount,
    });
  });

  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    items,
    grandTotal,
  };
}

/**
 * Collect all committed quotes in a shape suitable for PDF generation.
 */
function collectQuotesForPdf(state, catalogs) {
  const tabs = state.tabs || [];
  const quotes = [];

  tabs.forEach((tab, index) => {
    if (!tab.serviceType) return;
    if (tab.isDirty) return;

    const committedInputs = tab.committedInputs || {};
    const result = calculateQuoteForService(
      tab.serviceType,
      committedInputs,
      catalogs
    );
    if (!result) return;

    const meta = result.meta || {};

    // Selling price: same logic as global summary
    let sellingPrice = 0;
    if (meta.rushFinalSellPrice != null) {
      const v = Number(meta.rushFinalSellPrice);
      if (Number.isFinite(v) && !Number.isNaN(v)) {
        sellingPrice = v;
      }
    } else if (meta.finalSellPrice != null) {
      const v = Number(meta.finalSellPrice);
      if (Number.isFinite(v) && !Number.isNaN(v)) {
        sellingPrice = v;
      }
    } else {
      const v = Number(result.total);
      if (Number.isFinite(v) && !Number.isNaN(v)) {
        sellingPrice = v;
      }
    }

    const committedName = committedInputs.quoteName;
    const displayName =
      (committedName && String(committedName).trim()) ||
      (tab.quoteName && tab.quoteName.trim()) ||
      tab.label ||
      `Quote ${index + 1}`;

    const isRush = !!committedInputs.allowRush;

    const completionDays =
      typeof meta.completionDays === 'number' ? meta.completionDays : null;
    const deliveryDays =
      typeof meta.deliveryDays === 'number' ? meta.deliveryDays : null;

    quotes.push({
      id: tab.id,
      name: displayName,
      serviceTypeLabel: tab.serviceLabel || meta.serviceTypeLabel || tab.serviceType,
      isRush,
      sellingPrice,
      completionDays,
      deliveryDays,
      inputs: committedInputs,
      lineItems: result.lineItems || [],
      meta,
    });
  });

  return quotes;
}
