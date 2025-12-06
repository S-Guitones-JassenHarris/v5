// src/service-types/three-d-design/fields.js

// Field configuration for 3D Design service

export const Design3dFields = [
  // --- Core design info ---

  {
    id: 'designCoreSection',
    label: 'Design details',
    inputType: 'section',
  },
  {
    id: 'estimatedDesignHours',
    label: 'Estimated design hours',
    inputType: 'number',
    required: true,
    placeholder: 'Estimated design time in hours',
  },
  {
    id: 'designComplexity',
    label: 'Design complexity',
    inputType: 'select',
    required: true,
  },
  {
    id: 'profitMarginPercent',
    label: 'Profit margin (%)',
    inputType: 'number',
    required: true,
    placeholder: 'e.g. 30',
  },
  {
    id: 'allowRush',
    label: 'Allow rush option',
    inputType: 'checkbox',
    required: false,
  },
  {
    id: 'notes',
    label: 'Notes',
    inputType: 'textarea',
    required: false,
    placeholder: 'Add notes here',
    updateOn: 'blur',
  },

  // --- Extra / advanced fields divider ---

  {
    id: 'extraFieldsSection',
    label: 'Extra Fields',
    inputType: 'section',
  },

  // --- Advanced fields (collapsible) ---

  {
    id: 'advancedSection',
    label: 'Advanced fields',
    inputType: 'section',
  },
  {
    id: 'electricalCostPerKwh',
    label: 'Electrical cost per kWh (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Default 12.5',
    updateOn: 'blur',
  },
  {
    id: 'basicServiceCostPerHour',
    label: 'Basic service cost per hour (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Default 500',
    updateOn: 'blur',
  },
];
