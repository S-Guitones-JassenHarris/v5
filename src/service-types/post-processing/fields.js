// src/service-types/post-processing/fields.js

// Field configuration for Post Processing service

export const postProcessingFields = [
  {
    id: 'coreSection',
    label: 'Post processing details',
    inputType: 'section',
  },
  {
    id: 'estimatedPostProcessHours',
    label: 'Estimated total post processing time (hours)',
    inputType: 'number',
    required: true,
    placeholder: 'Total post processing time in hours',
  },
  {
    id: 'postProcessComplexity',
    label: 'Post process complexity',
    inputType: 'select',
    required: true,
    options: [
    { value: 'none', label: 'none' },
    { value: 'easy', label: 'easy' },
    { value: 'standard', label: 'standard' },
    { value: 'hard', label: 'hard' },
    { value: 'extreme', label: 'extreme' },
  ],
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
    id: 'electricalToolUsage',
    label: 'Electrical tool usage level',
    inputType: 'select',
    required: true,
    options: [
    { value: 'none', label: 'none' },
    { value: 'minimal', label: 'minimal' },
    { value: 'significant', label: 'significant' },
    { value: 'moderate', label: 'moderate' },
    { value: 'heavy', label: 'heavy' },
  ],
  },
  {
    id: 'procurementCosts',
    label: 'Procurement costs (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Total procurement costs, if any',
  },
  {
    id: 'miscCosts',
    label: 'Misc costs (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Miscellaneous costs',
  },
  {
    id: 'notes',
    label: 'Notes',
    inputType: 'textarea',
    required: false,
    placeholder: 'Add notes and misc cost breakdown here',
    updateOn: 'blur',
  },

  {
    id: 'extraFieldsSection',
    label: 'Extra Fields',
    inputType: 'section',
  },

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
