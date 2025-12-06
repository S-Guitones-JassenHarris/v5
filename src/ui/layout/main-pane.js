// src/ui/layout/main-pane.js

import {
  getAllServiceTypes,
  getServiceTypeById,
  getFieldsForService,
} from '../../service-types/index.js';
import { createQuoteForm } from '../quotes/quote-form.js';

export function createMainPane({
  activeTab,
  onServiceTypeSelected,
  onFieldChange,
} = {}) {
  const mainPane = document.createElement('div');
  mainPane.className = 'main-pane';

  if (!activeTab) {
    const empty = document.createElement('div');
    empty.className = 'main-pane-placeholder';
    empty.textContent =
      'No active quote. Create or select a quote tab using the bar above.';
    mainPane.appendChild(empty);
    return mainPane;
  }

  const header = document.createElement('div');
  header.className = 'main-pane-header';

  const title = document.createElement('h2');
  title.textContent = 'Quote details';
  header.appendChild(title);

  mainPane.appendChild(header);

  // --- Quote name input (treated like any other field, but synced on blur/change) ---

  const nameWrapper = document.createElement('div');
  nameWrapper.style.display = 'flex';
  nameWrapper.style.flexDirection = 'column';
  nameWrapper.style.gap = '0.25rem';
  nameWrapper.style.marginBottom = '0.5rem';

  const nameLabel = document.createElement('label');
  nameLabel.style.fontSize = '0.8rem';
  nameLabel.style.color = 'var(--text-main)';
  nameLabel.textContent = 'Quote name';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.style.padding = '0.4rem 0.6rem';
  nameInput.style.borderRadius = '0.6rem';
  nameInput.style.border = '1px solid rgba(148, 163, 184, 0.6)';
  nameInput.style.background = 'rgba(15, 23, 42, 0.9)';
  nameInput.style.color = 'var(--text-main)';
  nameInput.style.fontSize = '0.8rem';
  nameInput.placeholder = activeTab.label || 'Quote';

  const liveInputs = activeTab.inputs || {};
  const quoteNameValue =
    liveInputs.quoteName != null && liveInputs.quoteName !== undefined
      ? String(liveInputs.quoteName)
      : activeTab.quoteName || '';

  nameInput.value = quoteNameValue;

  const handleNameCommit = (e) => {
    if (typeof onFieldChange === 'function') {
      onFieldChange('quoteName', e.target.value);
    }
  };

  // Use change/blur instead of input to avoid re-render on every keystroke
  nameInput.addEventListener('change', handleNameCommit);
  nameInput.addEventListener('blur', handleNameCommit);

  nameWrapper.appendChild(nameLabel);
  nameWrapper.appendChild(nameInput);
  mainPane.appendChild(nameWrapper);

  // --- Service type selection ---

  const serviceWrapper = document.createElement('div');
  serviceWrapper.style.marginBottom = '0.75rem';

  const serviceLabel = document.createElement('div');
  serviceLabel.style.fontSize = '0.8rem';
  serviceLabel.style.color = 'var(--text-main)';
  serviceLabel.style.marginBottom = '0.25rem';
  serviceLabel.textContent = 'Service type';

  const serviceSelect = document.createElement('select');
  serviceSelect.className = 'service-select';

  const placeholderOpt = document.createElement('option');
  placeholderOpt.value = '';
  placeholderOpt.disabled = true;
  placeholderOpt.textContent = 'Choose a service type...';
  serviceSelect.appendChild(placeholderOpt);

  const serviceTypes = getAllServiceTypes();
  serviceTypes.forEach((svc) => {
    const opt = document.createElement('option');
    opt.value = svc.id;
    opt.textContent = svc.label;
    if (activeTab.serviceType === svc.id) {
      opt.selected = true;
    }
    serviceSelect.appendChild(opt);
  });

  if (!activeTab.serviceType) {
    serviceSelect.value = '';
  }

  serviceSelect.addEventListener('change', (e) => {
    const value = e.target.value || null;
    if (typeof onServiceTypeSelected === 'function') {
      onServiceTypeSelected(value);
    }
  });

  serviceWrapper.appendChild(serviceLabel);
  serviceWrapper.appendChild(serviceSelect);
  mainPane.appendChild(serviceWrapper);

  // If no service selected yet, show a friendly hint and stop
  if (!activeTab.serviceType) {
    const hint = document.createElement('div');
    hint.className = 'main-pane-placeholder';
    hint.textContent =
      'Select a service type to configure inputs for this quote.';
    mainPane.appendChild(hint);
    return mainPane;
  }

  const serviceDef = getServiceTypeById(activeTab.serviceType);

  const info = document.createElement('div');
  info.className = 'main-pane-service-info';
  info.textContent = serviceDef
    ? `Configuring: ${serviceDef.label}`
    : 'Configuring selected service';

  mainPane.appendChild(info);

  // Dynamic form for this service type
  const fields = getFieldsForService(activeTab.serviceType);
  const values = activeTab.inputs || {};

  const form = createQuoteForm({
    fields,
    values,
    onFieldChange,
  });

  mainPane.appendChild(form);

  return mainPane;
}
