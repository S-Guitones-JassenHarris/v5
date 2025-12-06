// src/ui/quotes/quote-service-picker.js

import { listServiceTypes } from '../../service-types/index.js';

export function createQuoteServicePicker({ selectedServiceTypeId, onChange } = {}) {
  const container = document.createElement('div');

  const label = document.createElement('div');
  label.style.fontSize = '0.8rem';
  label.style.marginBottom = '0.3rem';
  label.style.color = 'var(--text-muted)';
  label.textContent = 'Select service type:';
  container.appendChild(label);

  const select = document.createElement('select');
  select.style.padding = '0.4rem 0.6rem';
  select.style.borderRadius = '999px';
  select.style.background = 'rgba(15, 23, 42, 0.9)';
  select.style.border = '1px solid rgba(148, 163, 184, 0.5)';
  select.style.color = 'var(--text-main)';
  select.style.fontSize = '0.8rem';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = !selectedServiceTypeId;
  placeholder.textContent = 'Choose a service...';
  select.appendChild(placeholder);

  const services = listServiceTypes();
  services.forEach((def) => {
    const opt = document.createElement('option');
    opt.value = def.id;
    opt.textContent = def.label;
    if (def.id === selectedServiceTypeId) opt.selected = true;
    select.appendChild(opt);
  });

  select.addEventListener('change', () => {
    const value = select.value || null;
    if (typeof onChange === 'function') {
      onChange(value);
    }
  });

  container.appendChild(select);
  return container;
}
