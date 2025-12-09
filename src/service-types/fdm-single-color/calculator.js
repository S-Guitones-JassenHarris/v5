// src/service-types/fdm-single-color/calculator.js

// Real calculator for FDM Single Color service

// ----------------------------------------------------
// Centralized defaults for advanced fields & machines
// ----------------------------------------------------

// Advanced / service-related defaults
const DEFAULT_TEST_PRINT_COUNT = 0;
const DEFAULT_BATCH_COUNT = 1;
const DEFAULT_PREPARATION_MINUTES = 0;
const DEFAULT_HANDLING_MINUTES_PER_BATCH = 10;      // default 10 minutes per batch
const DEFAULT_ELECTRICAL_COST_PER_KWH = 12.5;       // PHP per kWh
const DEFAULT_BASIC_SERVICE_COST_PER_HOUR = 500;    // PHP per hour
const DEFAULT_MISC_COSTS = 0;                       // PHP
const DEFAULT_LEAD_TIME_MULTIPLIER = 5;             // lead time = totalPrintTimeHours * 5

// Machine ROI defaults
const DEFAULT_CUSTOM_MACHINE_ROI_HOURS = 2190;      // for custom machines
const DEFAULT_MACHINE_ROI_HOURS_FALLBACK = 2190;    // fallback for CSV machines if ROI missing

// VAT / adjustment assumptions for custom machine price
const CUSTOM_MACHINE_VAT_FACTOR = 1.12;             // customMachinePriceAdjusted = price / 1.12

export function calculateFdmSingleColorQuote(inputs = {}, catalogs = {}) {
  const machines = catalogs.machines || [];
  const materials = catalogs.materials || [];

  // --- Core input values ---

  const printHours = toNumber(inputs.printHours, 0);
  const printMinutes = toNumber(inputs.printMinutes, 0);
  const printWeightGrams = toNumber(inputs.printWeightGrams, 0);
  const profitMarginPercent = toNumber(inputs.profitMarginPercent, 0);
  const profitMarginDecimal = clamp(profitMarginPercent / 100, 0, 0.99);

  const allowRush = !!inputs.allowRush;

  // Advanced / service fields using centralized defaults
  const testPrintCount = toNumber(
    inputs.testPrintCount,
    DEFAULT_TEST_PRINT_COUNT
  );
  const batchCount = toNumber(inputs.batchCount, DEFAULT_BATCH_COUNT);
  const preparationMinutes = toNumber(
    inputs.preparationMinutes,
    DEFAULT_PREPARATION_MINUTES
  );
  const handlingMinutesPerBatch = toNumber(
    inputs.handlingMinutesPerBatch,
    DEFAULT_HANDLING_MINUTES_PER_BATCH
  );
  const electricalCostPerKwh = toNumber(
    inputs.electricalCostPerKwh,
    DEFAULT_ELECTRICAL_COST_PER_KWH
  );
  const basicServiceCostPerHour = toNumber(
    inputs.basicServiceCostPerHour,
    DEFAULT_BASIC_SERVICE_COST_PER_HOUR
  );
  const miscCosts = toNumber(inputs.miscCosts, DEFAULT_MISC_COSTS);

  // --- Derived inputs ---

  const totalPrintTimeHours =
    printHours + (printMinutes > 0 ? printMinutes / 60 : 0);

  const kgWeight = printWeightGrams / 1000;

  const leadTimeDefaultHours =
    totalPrintTimeHours * DEFAULT_LEAD_TIME_MULTIPLIER;
  const leadTimeHours = toNumber(inputs.leadTimeHours, leadTimeDefaultHours);

  // --- Machine (CSV or custom) ---

  const machineId = inputs.printerMachineId;
  const isCustomMachine = machineId === '__custom__';

  let machineAdjustedPrice;
  let machineRoiHours;
  let machinePowerWatts;

  if (isCustomMachine) {
    // Custom machine: use price, adjust internally
    const customMachinePrice = toNumber(inputs.customMachinePricePhp, 0);
    const customMachinePriceAdjusted =
      customMachinePrice > 0
        ? customMachinePrice / CUSTOM_MACHINE_VAT_FACTOR
        : 0;

    machineAdjustedPrice = customMachinePriceAdjusted;
    machineRoiHours = toNumber(
      inputs.customMachineRoiHours,
      DEFAULT_CUSTOM_MACHINE_ROI_HOURS
    );
    machinePowerWatts = toNumber(inputs.customMachinePowerWatts, 0);
  } else {
    const selectedMachine =
      machines.find((m) => String(m.machine_id) === String(machineId)) ||
      null;

    machineAdjustedPrice = selectedMachine
      ? toNumber(selectedMachine.adjusted_machine_price_php, 0)
      : 0;
    machineRoiHours = selectedMachine
      ? toNumber(
          selectedMachine.roi_hours,
          DEFAULT_MACHINE_ROI_HOURS_FALLBACK
        )
      : DEFAULT_MACHINE_ROI_HOURS_FALLBACK;
    machinePowerWatts = selectedMachine
      ? toNumber(selectedMachine.power_watts, 0)
      : 0;
  }

  // --- Material (CSV or custom) ---

  const materialId = inputs.materialId;
  const isCustomMaterial = materialId === '__custom__';

  let materialAdjustedPricePerKg;

  if (isCustomMaterial) {
    materialAdjustedPricePerKg = toNumber(
      (inputs.customMaterialPricePerKg/1.12),
      0
    );
  } else {
    const selectedMaterial =
      materials.find((m) => String(m.material_id) === String(materialId)) ||
      null;

    materialAdjustedPricePerKg = selectedMaterial
      ? toNumber(selectedMaterial.adjusted_price_per_kg, 0)
      : 0;
  }

  // --- Cost calculations ---

  const machineCost =
    (machineAdjustedPrice / machineRoiHours) * totalPrintTimeHours || 0;

  const powerCost =
    ((machinePowerWatts * totalPrintTimeHours) / 1000) * electricalCostPerKwh ||
    0;

  const materialCost = kgWeight * materialAdjustedPricePerKg || 0;

  // singlePrintExpense EXCLUDES miscCosts (misc is per-job, not per print)
  const singlePrintExpense = machineCost + powerCost + materialCost;

  // NEW SERVICE COST LOGIC:
  // Service cost = [(handlingMinutesPerBatch * (batchCount + testPrintCount))
  //                 + preparationMinutes] * (basicServiceCostPerHour / 60)
  const totalServiceMinutes =
    handlingMinutesPerBatch * (batchCount + testPrintCount) +
    preparationMinutes;

  const serviceCost =
    totalServiceMinutes * (basicServiceCostPerHour / 60) || 0;

  const testPrintsExpense = singlePrintExpense * testPrintCount;
  const sellPrintsExpense = singlePrintExpense * batchCount;

  // --- Sell prints with profit (unchanged logic) ---

  const sellPrintsWithProfit =
    profitMarginDecimal >= 0.99
      ? sellPrintsExpense
      : sellPrintsExpense / (1 - profitMarginDecimal);

  const sellPrintProfit = sellPrintsWithProfit - sellPrintsExpense;

  // --- Test prints with profit (YOUR NEW LOGIC) ---
  //
  // testPrintsWithProfit =
  //   (((testPrintsExpense / (1 - profitMarginDecimal)) - testPrintsExpense) / 2)
  //   + testPrintsExpense

  let testPrintsWithProfit;

  if (profitMarginDecimal >= 0.99) {
    // Avoid division by zero / negative denominator
    testPrintsWithProfit = testPrintsExpense;
  } else {
    const fullProfitVersion = testPrintsExpense / (1 - profitMarginDecimal);
    const fullProfitAmount = fullProfitVersion - testPrintsExpense;
    const halfProfitAmount = fullProfitAmount / 2;

    testPrintsWithProfit = testPrintsExpense + halfProfitAmount;
  }

  const testPrintProfit = testPrintsWithProfit - testPrintsExpense;

  // --- Totals, final prices, completion times ---

  // Total expenses includes miscCosts once (per job)
  const totalExpenses =
    serviceCost + testPrintsExpense + sellPrintsExpense + miscCosts;
  const totalProfit = sellPrintProfit + testPrintProfit;

  // Final sell price:
  // Sell prints with profit + Test prints with profit + Service cost + Misc costs
  const finalSellPrice =
    sellPrintsWithProfit + testPrintsWithProfit + serviceCost + miscCosts;

  const rushFinalSellPrice = allowRush ? finalSellPrice * 1.5 : null;

  // Completion days with minimum of 3 days (when there is a real print time)
  let completionDays =
    totalPrintTimeHours > 0 ? Math.ceil(leadTimeHours / 8) : 0;
  if (totalPrintTimeHours > 0) {
    completionDays = Math.max(3, completionDays);
  }

  let rushCompletionDays =
    allowRush && totalPrintTimeHours > 0
      ? Math.ceil(leadTimeHours / 10)
      : null;
  if (allowRush && totalPrintTimeHours > 0 && rushCompletionDays != null) {
    rushCompletionDays = Math.max(3, rushCompletionDays);
  }

  // --- Line items for sidebar ---

  const lineItems = [];

  lineItems.push({
    id: 'machineCost',
    label: 'Machine cost',
    amount: machineCost,
  });
  lineItems.push({
    id: 'powerCost',
    label: 'Power cost',
    amount: powerCost,
  });
  lineItems.push({
    id: 'materialCost',
    label: 'Material cost',
    amount: materialCost,
  });
  lineItems.push({
    id: 'singlePrintExpense',
    label: 'Single print expense',
    amount: singlePrintExpense,
  });
  // Misc as a separate line item
  lineItems.push({
    id: 'miscCosts',
    label: 'Misc costs',
    amount: miscCosts,
  });
  lineItems.push({
    id: 'serviceCost',
    label: 'Service cost',
    amount: serviceCost,
  });
  lineItems.push({
    id: 'testPrintsExpense',
    label: 'Test prints expense',
    amount: testPrintsExpense,
  });
  lineItems.push({
    id: 'sellPrintsExpense',
    label: 'Sell prints expense',
    amount: sellPrintsExpense,
  });
  lineItems.push({
    id: 'testPrintsWithProfit',
    label: 'Test prints with profit',
    amount: testPrintsWithProfit,
  });
  lineItems.push({
    id: 'sellPrintsWithProfit',
    label: 'Sell prints with profit',
    amount: sellPrintsWithProfit,
  });
  lineItems.push({
    id: 'sellPrintProfit',
    label: 'Sell print profit',
    amount: sellPrintProfit,
  });
  lineItems.push({
    id: 'testPrintProfit',
    label: 'Test print profit',
    amount: testPrintProfit,
  });
  lineItems.push({
    id: 'totalExpenses',
    label: 'Total expenses',
    amount: totalExpenses,
  });
  lineItems.push({
    id: 'totalProfit',
    label: 'Total profit',
    amount: totalProfit,
  });
  lineItems.push({
    id: 'finalSellPrice',
    label: 'Final sell price',
    amount: finalSellPrice,
  });

  if (rushFinalSellPrice != null) {
    lineItems.push({
      id: 'rushFinalSellPrice',
      label: 'Rush final sell price',
      amount: rushFinalSellPrice,
    });
  }

  // Completion time (displayed as text via meta, amount=0 placeholder)
  lineItems.push({
    id: 'completionTime',
    label: 'Completion time',
    amount: 0,
  });

  const subtotal = totalExpenses;
  const adjustments = 0;

  // Total follows your "Selling price" rule:
  // - If rush is allowed, total = rush final sell price
  // - Otherwise, total = final sell price
  const total =
    rushFinalSellPrice != null ? rushFinalSellPrice : finalSellPrice;

  return {
    lineItems,
    subtotal,
    adjustments,
    total,
    meta: {
      totalPrintTimeHours,
      kgWeight,
      leadTimeHours,
      completionDays,
      rushCompletionDays,
      finalSellPrice,
      rushFinalSellPrice,
      totalExpenses,
      totalProfit,
    },
  };
}

function toNumber(value, fallback = 0) {
  // Treat empty string, null, or undefined as "no value" → use fallback
  if (value === '' || value === null || typeof value === 'undefined') {
    return fallback;
  }

  const n = Number(value);
  if (!Number.isFinite(n) || Number.isNaN(n)) return fallback;
  return n;
}


function clamp(v, min, max) {
  if (v < min) return min;
  if (v > max) return max;
  return v;
}
