// src/service-types/wash-cure/fields.js

// Field configuration for Wash & Cure service

export const washCureFields = [
  // --- Core times & machines ---

  {
    id: 'coreSection',
    label: 'Wash & Cure details',
    inputType: 'section',
  },
  {
    id: 'handleTimePerBatchMinutes',
    label: 'Wash & cure handle time per batch (minutes)',
    inputType: 'number',
    required: true,
    placeholder: 'Handling time in minutes per batch',
  },
  {
    id: 'washTimeMinutes',
    label: 'Wash time (minutes)',
    inputType: 'number',
    required: true,
    placeholder: 'Wash time per batch in minutes',
  },
  {
    id: 'washMachineId',
    label: 'Wash machine',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: 'wash cure',
    optionValueField: 'machine_id',
    optionLabelField: 'machine_name',
    allowCustom: true,
    required: true,
  },
  {
    id: 'cureTimeMinutes',
    label: 'Cure time (minutes)',
    inputType: 'number',
    required: true,
    placeholder: 'Cure time per batch in minutes',
  },
  {
    id: 'cureMachineId',
    label: 'Cure machine',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: 'wash cure',
    optionValueField: 'machine_id',
    optionLabelField: 'machine_name',
    allowCustom: true,
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

  // --- Extra / advanced divider ---

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
    id: 'washBatchCount',
    label: 'Washbatches',
    inputType: 'number',
    required: false,
    placeholder: 'Default 1',
    updateOn: 'blur',
  },
  {
    id: 'cureBatchCount',
    label: 'Curebatches',
    inputType: 'number',
    required: false,
    placeholder: 'Default 1',
    updateOn: 'blur',
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

  // --- Custom wash machine ---

  {
    id: 'customWashMachineSection',
    label: 'Custom wash machine (used only when Wash machine = Custom option...)',
    inputType: 'section',
  },
  {
    id: 'customWashMachineName',
    label: 'Custom wash machine name',
    inputType: 'text',
    required: false,
    placeholder: 'e.g. Custom Wash Unit',
    updateOn: 'blur',
  },
  {
    id: 'customWashMachinePricePhp',
    label: 'Custom wash machine price (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Gross/total price; adjusted in calculator',
    updateOn: 'blur',
  },
  {
    id: 'customWashMachineRoiHours',
    label: 'Custom wash machine ROI hours',
    inputType: 'number',
    required: false,
    placeholder: 'Default 2190 if empty',
    updateOn: 'blur',
  },
  {
    id: 'customWashMachinePowerWatts',
    label: 'Custom wash machine wattage (W)',
    inputType: 'number',
    required: false,
    placeholder: 'Power consumption in watts',
    updateOn: 'blur',
  },

  // --- Custom cure machine ---

  {
    id: 'customCureMachineSection',
    label: 'Custom cure machine (used only when Cure machine = Custom option...)',
    inputType: 'section',
  },
  {
    id: 'customCureMachineName',
    label: 'Custom cure machine name',
    inputType: 'text',
    required: false,
    placeholder: 'e.g. Custom Cure Unit',
    updateOn: 'blur',
  },
  {
    id: 'customCureMachinePricePhp',
    label: 'Custom cure machine price (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Gross/total price; adjusted in calculator',
    updateOn: 'blur',
  },
  {
    id: 'customCureMachineRoiHours',
    label: 'Custom cure machine ROI hours',
    inputType: 'number',
    required: false,
    placeholder: 'Default 2190 if empty',
    updateOn: 'blur',
  },
  {
    id: 'customCureMachinePowerWatts',
    label: 'Custom cure machine wattage (W)',
    inputType: 'number',
    required: false,
    placeholder: 'Power consumption in watts',
    updateOn: 'blur',
  },
];
