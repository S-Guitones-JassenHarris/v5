// src/service-types/fgf-printing/fields.js

// Field configuration for FGF Printing service
// Same as FDM Single Color, but filtered to FGF materials/machines.

export const fgfPrintingFields = [
  // --- Print time ---

  {
    id: 'printTimeSection',
    label: 'Print time',
    inputType: 'section',
  },
  {
    id: 'printHours',
    label: 'Print hours',
    inputType: 'number',
    required: true,
    placeholder: 'Hours',
  },
  {
    id: 'printMinutes',
    label: 'Print minutes',
    inputType: 'number',
    required: false,
    placeholder: 'Minutes',
  },

  // --- Part details ---

  {
    id: 'partDetailsSection',
    label: 'Part details',
    inputType: 'section',
  },
  {
    id: 'printWeightGrams',
    label: 'Print weight (g)',
    inputType: 'number',
    required: true,
    placeholder: 'Weight in grams',
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

  // --- Machine & material selection ---

  {
    id: 'machineSection',
    label: 'Machine and material',
    inputType: 'section',
  },

  // Printer brand (FGF machines)
  {
    id: 'printerBrand',
    label: 'Printer brand',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: 'FGF printing', // matches machines.job_type
    distinctValueField: 'brand',
    optionValueField: 'brand',
    optionLabelField: 'brand',
    required: true,
  },

  // Printer (specific FGF machine)
  {
    id: 'printerMachineId',
    label: 'Printer',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: 'FGF printing', // matches machines.job_type
    filterByFieldId: 'printerBrand',
    filterByFieldColumn: 'brand',
    optionValueField: 'machine_id',
    optionLabelField: 'machine_name',
    allowCustom: true,
    required: true,
  },

  // Material type (FGF materials)
  {
    id: 'materialType',
    label: 'Material type',
    inputType: 'select',
    catalogId: 'materials',
    filterJobTypeValue: 'FGF Printing', // matches materials.Job_type
    distinctValueField: 'material_type',
    optionValueField: 'material_type',
    optionLabelField: 'material_type',
    required: true,
  },

  // Material (specific FGF material)
  {
    id: 'materialId',
    label: 'Material',
    inputType: 'select',
    catalogId: 'materials',
    filterJobTypeValue: 'FGF Printing', // matches materials.Job_type
    filterByFieldId: 'materialType',
    filterByFieldColumn: 'material_type',
    optionValueField: 'material_id',
    optionLabelField: 'material_name',
    allowCustom: true,
    required: true,
  },

  // --- Extra Fields divider (non-collapsible) ---

  {
    id: 'extraFieldsSection',
    label: 'Extra Fields',
    inputType: 'section',
  },

  // --- Advanced fields (collapsible, commit on blur) ---

  {
    id: 'advancedSection',
    label: 'Advanced fields',
    inputType: 'section',
  },
  {
    id: 'testPrintCount',
    label: 'Number of test prints',
    inputType: 'number',
    required: false,
    placeholder: 'Default 0',
    updateOn: 'blur',
  },
  {
    id: 'batchCount',
    label: 'Number of batches',
    inputType: 'number',
    required: false,
    placeholder: 'Default 1',
    updateOn: 'blur',
  },
  {
    id: 'preparationMinutes',
    label: 'Preparation minutes',
    inputType: 'number',
    required: false,
    placeholder: 'Setup time in minutes',
    updateOn: 'blur',
  },
  {
    id: 'handlingMinutesPerBatch',
    label: 'Handling minutes per batch',
    inputType: 'number',
    required: false,
    placeholder: 'Handling per batch in minutes (default 10)',
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
  {
    id: 'leadTimeHours',
    label: 'Lead time (hours)',
    inputType: 'number',
    required: false,
    placeholder: 'Auto default = Total print time × 5, hard minimum cap of 3 days',
    updateOn: 'blur',
  },
  {
    id: 'miscCosts',
    label: 'Misc costs (PHP)',
    inputType: 'number',
    required: false,
    placeholder: 'Additional costs not covered above',
    updateOn: 'blur',
  },
  {
    id: 'notes',
    label: 'Notes',
    inputType: 'textarea',
    required: false,
    placeholder: 'Add notes and misc cost breakdown here',
    updateOn: 'blur',
  },

  // --- Custom machine (collapsible, commit on blur) ---

  {
    id: 'customMachineSection',
    label: 'Custom machine (used only when Printer = Custom option...)',
    inputType: 'section',
  },
  {
    id: 'customMachineName',
    label: 'Custom machine name',
    inputType: 'text',
    required: false,
    placeholder: 'e.g. Custom FGF System',
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
    label: 'Custom machine power (W)',
    inputType: 'number',
    required: false,
    placeholder: 'Power consumption in watts',
    updateOn: 'blur',
  },

  // --- Custom material (collapsible, commit on blur) ---

  {
    id: 'customMaterialSection',
    label: 'Custom material (used only when Material = Custom option...)',
    inputType: 'section',
  },
  {
    id: 'customMaterialName',
    label: 'Custom material name',
    inputType: 'text',
    required: false,
    placeholder: 'e.g. Special Granulate Blend',
    updateOn: 'blur',
  },
  {
    id: 'customMaterialPricePerKg',
    label: 'Custom material price per kg (PHP)',
    inputType: 'number',
    required: false,
    placeholder: ' Price per kg in PHP',
    updateOn: 'blur',
  },
  {
    id: 'customMaterialType',
    label: 'Custom material type',
    inputType: 'text',
    required: false,
    placeholder: 'e.g. ABS, PETG, PLA, etc.',
    updateOn: 'blur',
  },
];
