// src/service-types/fdm-multi-color/fields.js

// Field configuration for FDM Multi Color service

export const fdmMultiColorFields = [
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

  // --- Profit / rush ---

  {
    id: 'pricingSection',
    label: 'Pricing & options',
    inputType: 'section',
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

  // --- Machine selection ---

  {
    id: 'machineSection',
    label: 'Machine',
    inputType: 'section',
  },
  {
    id: 'printerBrand',
    label: 'Printer brand',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: 'fdm printing',
    distinctValueField: 'brand',
    optionValueField: 'brand',
    optionLabelField: 'brand',
    required: true,
  },
  {
    id: 'printerMachineId',
    label: 'Printer',
    inputType: 'select',
    catalogId: 'machines',
    filterJobTypeValue: 'fdm printing',
    filterByFieldId: 'printerBrand',
    filterByFieldColumn: 'brand',
    optionValueField: 'machine_id',
    optionLabelField: 'machine_name',
    allowCustom: true,
    required: true,
  },

  // --- Extra Fields divider ---

  {
    id: 'extraFieldsSection',
    label: 'Extra Fields',
    inputType: 'section',
  },

  // --- Material 1..8 sections ---

  ...buildMaterialSections(1),
  ...buildMaterialSections(2),
  ...buildMaterialSections(3),
  ...buildMaterialSections(4),
  ...buildMaterialSections(5),
  ...buildMaterialSections(6),
  ...buildMaterialSections(7),
  ...buildMaterialSections(8),

  // --- Advanced fields (same logic as single-color) ---

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
    placeholder: 'Auto default = Total print time × 5',
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

  // --- Custom machine (same style as fdm-single-color) ---

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
    placeholder: 'e.g. Custom FDM Multi-color',
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
];

// Helper to generate Material N section, no custom options
function buildMaterialSections(index) {
  const labelIdx = `Material ${index}`;
  const materialTypeId = `materialType${index}`;
  const materialId = `materialId${index}`;
  const weightId = `materialWeightGrams${index}`;

  return [
    {
      id: `materialSection${index}`,
      label: labelIdx,
      inputType: 'section',
    },
    {
      id: materialTypeId,
      label: `${labelIdx} type`,
      inputType: 'select',
      catalogId: 'materials',
      filterJobTypeValue: 'FDM Printing',
      distinctValueField: 'material_type',
      optionValueField: 'material_type',
      optionLabelField: 'material_type',
      required: false,
    },
    {
      id: materialId,
      label: labelIdx,
      inputType: 'select',
      catalogId: 'materials',
      filterJobTypeValue: 'FDM Printing',
      filterByFieldId: materialTypeId,
      filterByFieldColumn: 'material_type',
      optionValueField: 'material_id',
      optionLabelField: 'material_name',
      allowCustom: false,
      required: false,
    },
    {
      id: weightId,
      label: `${labelIdx} weight (g)`,
      inputType: 'number',
      required: false,
      placeholder: 'Weight in grams for this color',
    },
  ];
}
