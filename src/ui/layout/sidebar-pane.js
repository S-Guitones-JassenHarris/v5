// src/ui/layout/sidebar-pane.js

import { getServiceTypeById } from '../../service-types/index.js';

export function createSidebarPane({
  activeTab,
  quoteResult,
  globalSummary,
  onUpdateSummary,
} = {}) {
  const aside = document.createElement('aside');
  aside.className = 'app-sidebar';

  const inner = document.createElement('div');
  inner.className = 'sidebar-inner';

  const title = document.createElement('div');
  title.className = 'sidebar-title';
  title.textContent = 'Quote summary';

  inner.appendChild(title);

  // --- Global summary: all quotes selling price (final or rush) ---

  if (globalSummary && globalSummary.items && globalSummary.items.length > 0) {
    const globalBox = document.createElement('div');
    globalBox.className = 'sidebar-global-summary';

    const globalTitle = document.createElement('div');
    globalTitle.className = 'sidebar-global-title';
    globalTitle.textContent = 'All quotes (selling price)';

    globalBox.appendChild(globalTitle);

    const list = document.createElement('div');
    list.className = 'sidebar-global-list';

    globalSummary.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'sidebar-global-row';

      const label = document.createElement('div');
      label.className = 'sidebar-global-label';
      label.textContent = item.label;

      const amount = document.createElement('div');
      amount.className = 'sidebar-global-amount';
      amount.textContent = formatAmount(item.amount);
      row.appendChild(label);
      row.appendChild(amount);
      list.appendChild(row);
    });

    const totalRow = document.createElement('div');
    totalRow.className = 'sidebar-global-total';

    const totalLabel = document.createElement('div');
    totalLabel.textContent = 'Grand total';

    const totalAmount = document.createElement('div');
    totalAmount.textContent = 'PHP ' + formatAmount(globalSummary.grandTotal);

    totalRow.appendChild(totalLabel);
    totalRow.appendChild(totalAmount);

    globalBox.appendChild(list);
    globalBox.appendChild(totalRow);

    inner.appendChild(globalBox);
  } else {
    const noGlobal = document.createElement('div');
    noGlobal.className = 'sidebar-global-empty';
    noGlobal.textContent =
      'No committed quotes yet. Selling price totals will appear here.';
    inner.appendChild(noGlobal);
  }

  // --- Active tab section ---

  const subtitle = document.createElement('div');
  subtitle.className = 'sidebar-subtitle';

  if (!activeTab) {
    subtitle.textContent = 'No active quote selected.';
    inner.appendChild(subtitle);
    aside.appendChild(inner);
    return aside;
  }

  if (!activeTab.serviceType) {
    subtitle.textContent =
      'Choose a service type in the main pane to see a cost breakdown here.';
    inner.appendChild(subtitle);

    const btn = createUpdateButton(activeTab, onUpdateSummary);
    inner.appendChild(btn);

    aside.appendChild(inner);
    return aside;
  }

  const serviceDef = getServiceTypeById(activeTab.serviceType);

  const committedName =
    activeTab.committedInputs && activeTab.committedInputs.quoteName;
  const displayName =
    (committedName && String(committedName).trim()) ||
    (activeTab.quoteName && activeTab.quoteName.trim()) ||
    activeTab.label;

  subtitle.textContent = serviceDef
    ? `${serviceDef.label} · ${displayName}`
    : displayName;


  inner.appendChild(subtitle);

  if (activeTab.lastCommitError) {
    const error = document.createElement('div');
    error.className = 'sidebar-error';
    error.textContent = activeTab.lastCommitError;
    inner.appendChild(error);
  }

  if (!quoteResult) {
    const placeholder = document.createElement('div');
    placeholder.className = 'sidebar-placeholder';
    placeholder.textContent =
      'No committed calculation yet. Enter inputs in the main pane and click "Update summary" to compute a preliminary total.';
    inner.appendChild(placeholder);

    const btn = createUpdateButton(activeTab, onUpdateSummary);
    inner.appendChild(btn);

    aside.appendChild(inner);
    return aside;
  }

  // --- Line items (detailed breakdown) ---

  const list = document.createElement('div');
  list.style.marginTop = '0.5rem';
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '0.35rem';

  if (quoteResult.lineItems && quoteResult.lineItems.length > 0) {
    quoteResult.lineItems.forEach((item) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.fontSize = '0.8rem';

      const label = document.createElement('div');
      label.style.color = 'var(--text-muted)';
      label.textContent = item.label;

      const amount = document.createElement('div');
      amount.style.fontVariantNumeric = 'tabular-nums';

      if (
        item.id === 'completionTime' &&
        quoteResult.meta &&
        typeof quoteResult.meta.completionDays === 'number'
      ) {
        const meta = quoteResult.meta;
        if (meta.rushCompletionDays != null) {
          amount.textContent = `${meta.completionDays} days (rush: ${meta.rushCompletionDays} days)`;
        } else {
          amount.textContent = `${meta.completionDays} days`;
        }
      } else {
        amount.textContent = formatAmount(item.amount);
      }

      row.appendChild(label);
      row.appendChild(amount);
      list.appendChild(row);
    });
  } else {
    const noItems = document.createElement('div');
    noItems.className = 'sidebar-placeholder';
    noItems.textContent =
      'No line items yet for the committed inputs.';
    list.appendChild(noItems);
  }

  inner.appendChild(list);

  // --- Totals (subtotal expenses + selling price) ---

  const totals = document.createElement('div');
  totals.style.marginTop = '0.75rem';
  totals.style.paddingTop = '0.5rem';
  totals.style.borderTop = '1px dashed rgba(148, 163, 184, 0.6)';
  totals.style.display = 'flex';
  totals.style.flexDirection = 'column';
  totals.style.gap = '0.3rem';
  totals.style.fontSize = '0.8rem';

  const meta = quoteResult.meta || {};
  const sellingPrice = getSellingPrice(meta, quoteResult);

  const subtotalRow = document.createElement('div');
  subtotalRow.style.display = 'flex';
  subtotalRow.style.justifyContent = 'space-between';

  const subtotalLabel = document.createElement('div');
  subtotalLabel.style.color = 'var(--text-muted)';
  subtotalLabel.textContent = 'Subtotal expenses';

  const subtotalAmount = document.createElement('div');
  subtotalAmount.style.fontVariantNumeric = 'tabular-nums';
  subtotalAmount.textContent =
    'PHP ' + formatAmount(quoteResult.subtotal);

  subtotalRow.appendChild(subtotalLabel);
  subtotalRow.appendChild(subtotalAmount);
  totals.appendChild(subtotalRow);

  const totalRow = document.createElement('div');
  totalRow.style.display = 'flex';
  totalRow.style.justifyContent = 'space-between';
  totalRow.style.fontWeight = '600';

  const totalLabel = document.createElement('div');
  totalLabel.textContent = 'Selling price';

  const totalAmount = document.createElement('div');
  totalAmount.style.fontVariantNumeric = 'tabular-nums';
  totalAmount.textContent = 'PHP ' + formatAmount(sellingPrice);

  totalRow.appendChild(totalLabel);
  totalRow.appendChild(totalAmount);
  totals.appendChild(totalRow);

  inner.appendChild(totals);

  const btn = createUpdateButton(activeTab, onUpdateSummary);
  inner.appendChild(btn);

  aside.appendChild(inner);
  return aside;
}

function createUpdateButton(activeTab, onUpdateSummary) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Update summary';
  btn.className = 'btn btn--small';

  if (activeTab && activeTab.isDirty) {
    btn.classList.add('btn--danger');
    btn.title = 'Inputs changed, click to recalculate summary';
  } else {
    btn.title = 'Summary is up to date';
  }

  btn.addEventListener('click', () => {
    if (typeof onUpdateSummary === 'function') {
      onUpdateSummary();
    }
  });

  return btn;
}

function formatAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return '-';
  return n.toFixed(2);
}

/**
 * Determine the selling price for a quote:
 * - If rushFinalSellPrice is present, use that
 * - Else use finalSellPrice
 * - Else fall back to quoteResult.total
 */
function getSellingPrice(meta, quoteResult) {
  if (meta && meta.rushFinalSellPrice != null) {
    const v = Number(meta.rushFinalSellPrice);
    if (Number.isFinite(v) && !Number.isNaN(v)) return v;
  }

  if (meta && meta.finalSellPrice != null) {
    const v = Number(meta.finalSellPrice);
    if (Number.isFinite(v) && !Number.isNaN(v)) return v;
  }

  const fallback = Number(quoteResult && quoteResult.total);
  if (Number.isFinite(fallback) && !Number.isNaN(fallback)) {
    return fallback;
  }

  return 0;
}
