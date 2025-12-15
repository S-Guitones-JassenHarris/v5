// src/service-types/three-d-scan/fields.js

// Field configuration for 3D Scan service

export const Scan3dFields = [
  // --- Core scan info ---

  {
    id: 'scanCoreSection',
    label: 'Scan details',
    inputType: 'section',
  },
  {
    id: 'estimatedScanHours',
    label: 'Estimated scan time (hours)',
    inputType: 'number',
    required: true,
    placeholder: 'Estimated scan time in hours',
  },
  {
    id: 'scanComplexity',
    label: 'Scan complexity',
    inputType: 'select',
    required: true,
      options: [
    { value: 'Easy', label: 'Easy' },
    { value: 'Novice', label: 'Novice' },
    { value: 'Standard', label: 'Standard'},
    { value: 'Hard', label: 'Hard' },
    { value: 'Expert', label: 'Expert' },
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
    id: 'laptopUse',
    label: 'Laptop used during scan',
    inputType: 'checkbox',
    required: false,
  },

  // --- Scanner selection ---

  {
    id: 'machineSection',
    label: 'Scanning machine',
    inputType: 'section',
  },
  {
    id: 'scanMachineId',
    label: 'Scanning machine',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: '3d scan', // matches machines.job_type
    optionValueField: 'machine_id',
    optionLabelField: 'machine_name',
    allowCustom: true,
    required: true,
  },

  // --- Extra fields divider ---

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

  // --- Custom machine (collapsible) ---

  {
    id: 'customMachineSection',
    label: 'Custom machine (used only when Scanning machine = Custom option...)',
    inputType: 'section',
  },
  {
    id: 'customMachineName',
    label: 'Custom machine name',
    inputType: 'text',
    required: false,
    placeholder: 'e.g. Custom 3D Scanner',
    updateOn: 'blur',
  },
  {
    id: 'customMachinePricePhp',
    label: 'Custom machine price (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Gross/total price; adjusted in calculator',
    updateOn: 'blur',
  },
  {
    id: 'customMachineRoiHours',
    label: 'Custom machine ROI hours',
    inputType: 'number',
    required: false,
    placeholder: 'Default 2190 if empty',
    updateOn: 'blur',
  },
  {
    id: 'customMachinePowerWatts',
    label: 'Custom machine wattage (W)',
    inputType: 'number',
    required: false,
    placeholder: 'Power consumption in watts',
    updateOn: 'blur',
  },
];
