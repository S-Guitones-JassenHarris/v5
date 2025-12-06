// src/ui/quotes/quote-form.js

import { validateField } from '../../validation/field-validation.js';
import {
  getCatalog,
  areCatalogsLoaded,
} from '../../catalog/catalog-service.js';

// Section IDs that should be rendered as collapsible groups
const COLLAPSIBLE_SECTION_IDS = new Set([
  // Existing collapsibles
  'advancedSection',
  'customMachineSection',
  'customMaterialSection',
  // New for Wash & Cure
  'customWashMachineSection',
  'customCureMachineSection',
  // New for FDM Multi Color: material sections 1..8
  'materialSection1',
  'materialSection2',
  'materialSection3',
  'materialSection4',
  'materialSection5',
  'materialSection6',
  'materialSection7',
  'materialSection8',
]);

export function createQuoteForm({ fields, values, onFieldChange } = {}) {
  const form = document.createElement('div');
  form.style.marginTop = '1rem';
  form.style.display = 'flex';
  form.style.flexDirection = 'column';
  form.style.gap = '0.75rem';

  if (!fields || fields.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'main-pane-placeholder';
    empty.textContent =
      'No fields defined yet for this service type. This is a placeholder. Later you can customize fields for each service.';
    form.appendChild(empty);
    return form;
  }

  // 1) Group fields by section markers
  const groups = [];
  let currentGroup = null;

  fields.forEach((field) => {
    if (field.inputType === 'section') {
      // Start a new group anchored by this section
      currentGroup = {
        section: field,
        collapsible: COLLAPSIBLE_SECTION_IDS.has(field.id),
        fields: [],
      };
      groups.push(currentGroup);
    } else {
      // Non-section field; attach to current group (or create a default one)
      if (!currentGroup) {
        currentGroup = { section: null, collapsible: false, fields: [] };
        groups.push(currentGroup);
      }
      currentGroup.fields.push(field);
    }
  });

  // 2) Render each group
  groups.forEach((group) => {
    const { section, collapsible, fields: groupFields } = group;

    if (section) {
      if (collapsible) {
        // Collapsible section: header + content container
        const { container } = renderCollapsibleSection(
          section,
          groupFields,
          values,
          onFieldChange
        );
        form.appendChild(container);
        return;
      } else {
        // Non-collapsible section: simple divider/header
        const sectionWrapper = document.createElement('div');
        sectionWrapper.style.marginTop = '0.75rem';

        const hr = document.createElement('hr');
        hr.style.border = 'none';
        hr.style.borderTop = '1px solid rgba(148, 163, 184, 0.4)';
        hr.style.marginBottom = '0.35rem';

        const label = document.createElement('div');
        label.style.fontSize = '0.75rem';
        label.style.textTransform = 'uppercase';
        label.style.letterSpacing = '0.08em';
        label.style.color = 'var(--text-muted)';
        label.textContent = section.label || 'Section';

        sectionWrapper.appendChild(hr);
        sectionWrapper.appendChild(label);
        form.appendChild(sectionWrapper);
      }
    }

    // Render all fields in this group (for non-collapsible sections)
    if (!collapsible) {
      groupFields.forEach((field) => {
        const fieldNode = renderField(field, values, onFieldChange);
        if (fieldNode) {
          form.appendChild(fieldNode);
        }
      });
    }
  });

  return form;
}

// -------------------------
// Collapsible section UI
// -------------------------

function renderCollapsibleSection(sectionField, groupFields, values, onFieldChange) {
  const container = document.createElement('div');
  container.style.marginTop = '0.75rem';
  container.style.borderRadius = '0.6rem';
  container.style.border = '1px solid rgba(148, 163, 184, 0.35)';
  container.style.background = 'rgba(15, 23, 42, 0.7)';

  // Header
  const header = document.createElement('button');
  header.type = 'button';
  header.style.width = '100%';
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.justifyContent = 'space-between';
  header.style.padding = '0.4rem 0.75rem';
  header.style.background = 'transparent';
  header.style.border = 'none';
  header.style.cursor = 'pointer';
  header.style.color = 'var(--text-main)';
  header.style.fontSize = '0.8rem';
  header.style.fontWeight = '500';

  const title = document.createElement('span');
  title.textContent = sectionField.label || 'Section';

  const caret = document.createElement('span');
  caret.textContent = '▸'; // collapsed by default
  caret.style.fontSize = '0.75rem';
  caret.style.opacity = '0.8';

  header.appendChild(title);
  header.appendChild(caret);

  // Content
  const content = document.createElement('div');
  content.style.display = 'flex';
  content.style.flexDirection = 'column';
  content.style.gap = '0.5rem';
  content.style.padding = '0.5rem 0.75rem 0.75rem 0.75rem';

  // Initially collapsed
  let isOpen = false;
  content.style.display = 'none';

  header.addEventListener('click', () => {
    isOpen = !isOpen;
    content.style.display = isOpen ? 'flex' : 'none';
    caret.textContent = isOpen ? '▾' : '▸';
  });

  // Render fields inside this collapsible
  groupFields.forEach((field) => {
    const fieldNode = renderField(field, values, onFieldChange);
    if (fieldNode) {
      content.appendChild(fieldNode);
    }
  });

  container.appendChild(header);
  container.appendChild(content);

  return { container, header, content };
}

// -------------------------
// Single field renderer
// -------------------------

function renderField(field, values, onFieldChange) {
  // "section" fields are handled earlier via grouping
  if (field.inputType === 'section') {
    return null;
  }

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '0.25rem';

  const label = document.createElement('label');
  label.style.fontSize = '0.8rem';
  label.style.color = 'var(--text-main)';
  label.textContent = field.label || field.id;

  if (field.required) {
    const requiredMark = document.createElement('span');
    requiredMark.textContent = ' *';
    requiredMark.style.color = '#f97373';
    label.appendChild(requiredMark);
  }

  const controlValue =
    values && Object.prototype.hasOwnProperty.call(values, field.id)
      ? values[field.id]
      : '';

  let control;
  let isSelect = false;
  let isCheckbox = false;
  let isTextarea = false;

  if (field.inputType === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 3;
    isTextarea = true;
  } else if (field.inputType === 'select') {
    control = document.createElement('select');
    isSelect = true;
  } else if (field.inputType === 'checkbox') {
    control = document.createElement('input');
    control.type = 'checkbox';
    isCheckbox = true;
  } else {
    control = document.createElement('input');
    control.type = field.inputType === 'number' ? 'number' : 'text';
  }

  control.style.padding = isCheckbox ? '0' : '0.4rem 0.6rem';
  control.style.borderRadius = isCheckbox ? '0.3rem' : '0.6rem';
  control.style.border = '1px solid rgba(148, 163, 184, 0.6)';
  control.style.background = 'rgba(15, 23, 42, 0.9)';
  control.style.color = 'var(--text-main)';
  control.style.fontSize = '0.8rem';

  control.dataset.fieldId = field.id;

  if (isCheckbox) {
    control.style.width = '1rem';
    control.style.height = '1rem';
    control.checked = !!controlValue;
  } else if (!isSelect) {
    control.value = controlValue ?? '';
    if (field.placeholder) {
      control.placeholder = field.placeholder;
    }
  }

  if (isSelect) {
    populateSelectControl(control, field, controlValue, values);
  }

  // Validation
  const { isValid, message } = validateField(field, controlValue);

  if (!isValid && field.inputType !== 'checkbox') {
    control.classList.add('field-error-control');
    control.setAttribute('aria-invalid', 'true');

    const errorText = document.createElement('div');
    errorText.className = 'field-error-text';
    errorText.textContent = message;
    wrapper.appendChild(errorText);
  }

  // Event wiring
  const updateMode = field.updateOn || 'input';

  if (isCheckbox) {
    control.addEventListener('change', (e) => {
      if (typeof onFieldChange === 'function') {
        onFieldChange(field.id, !!e.target.checked);
      }
    });
  } else if (isSelect) {
    control.addEventListener('change', (e) => {
      if (typeof onFieldChange === 'function') {
        onFieldChange(field.id, e.target.value);
      }
    });
  } else if (isTextarea || control.type === 'text' || control.type === 'number') {
    if (updateMode === 'blur') {
      // Only commit on blur
      control.addEventListener('blur', (e) => {
        if (typeof onFieldChange === 'function') {
          onFieldChange(field.id, e.target.value);
        }
      });
    } else {
      // Default: commit on each input
      control.addEventListener('input', (e) => {
        if (typeof onFieldChange === 'function') {
          onFieldChange(field.id, e.target.value);
        }
      });
    }
  }

  wrapper.appendChild(label);
  wrapper.appendChild(control);
  return wrapper;
}

// -------------------------
// Select population helpers
// -------------------------

function populateSelectControl(selectEl, field, currentValue, values) {
  selectEl.innerHTML = '';

  const placeholderOpt = document.createElement('option');
  placeholderOpt.value = '';
  placeholderOpt.disabled = true;
  placeholderOpt.textContent = 'Choose...';
  placeholderOpt.selected = !currentValue;
  selectEl.appendChild(placeholderOpt);

  if (!field.catalogId) {
    return;
  }

  const loaded = areCatalogsLoaded();
  const rows = getCatalog(field.catalogId);

  if (!loaded) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.disabled = true;
    opt.textContent = 'Loading options...';
    selectEl.appendChild(opt);
    return;
  }

  if (!rows || rows.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.disabled = true;
    opt.textContent = 'No options available';
    selectEl.appendChild(opt);
    return;
  }

  // Filtering: by job type, then by another field (e.g. brand / material type)
  let filteredRows = rows.slice();

  if (field.filterJobTypeValue) {
    const target = normalizeJobType(field.filterJobTypeValue);
    filteredRows = filteredRows.filter((row) => {
      const jt = row.Job_type ?? row.job_type ?? '';
      return normalizeJobType(jt) === target;
    });
  }

  if (field.filterByFieldId && field.filterByFieldColumn) {
    const selected = values && values[field.filterByFieldId];
    if (selected) {
      filteredRows = filteredRows.filter(
        (row) => row[field.filterByFieldColumn] === selected
      );
    }
  }

  if (!filteredRows.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.disabled = true;
    opt.textContent = 'No options available';
    selectEl.appendChild(opt);
    return;
  }

  // Distinct-mode (e.g. brands, material types)
  if (field.distinctValueField) {
    const keyField = field.distinctValueField;
    const map = new Map();
    filteredRows.forEach((row) => {
      const key = row[keyField];
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, row);
      }
    });
    filteredRows = Array.from(map.values());
  }

  const valueKey = field.optionValueField || 'id';
  const labelKey = field.optionLabelField || 'name';

  filteredRows.forEach((row) => {
    const opt = document.createElement('option');
    const value = row[valueKey];
    const label = row[labelKey];

    opt.value = value;
    opt.textContent = label || value || '(unnamed)';

    if (currentValue && currentValue === value) {
      opt.selected = true;
    }

    selectEl.appendChild(opt);
  });

  if (field.allowCustom) {
    const customOpt = document.createElement('option');
    customOpt.value = '__custom__';
    customOpt.textContent = 'Custom option...';
    if (currentValue === '__custom__') {
      customOpt.selected = true;
    }
    selectEl.appendChild(customOpt);
  }
}

function normalizeJobType(value) {
  return String(value || '').trim().toLowerCase();
}
