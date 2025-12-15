// src/service-types/three-d-scan/calculator.js

// Calculator for 3D Scan service

// ------------------------------
// Defaults & constants
// ------------------------------

const ASSUMED_LAPTOP_WATTS = 300;          // W
const PER_DAY_HOURS = 8;                    // normal
const PER_DAY_RUSH_HOURS = 10;              // rush

const DEFAULT_ELECTRICAL_COST_PER_KWH = 12.5;   // PHP/kWh
const DEFAULT_BASIC_SERVICE_COST_PER_HOUR = 500; // PHP/hr

const DEFAULT_CUSTOM_MACHINE_ROI_HOURS = 2190;
const DEFAULT_MACHINE_ROI_HOURS_FALLBACK = 2190;
const CUSTOM_MACHINE_VAT_FACTOR = 1.12;

// Complexity mapping for scan complexity [1..5]
const COMPLEXITY_MAP = {
  easy: 1,
  novice: 1.4,
  standard: 2,
  hard: 2.75,
  expert: 3.25,
};

export function calculate3dScanQuote(inputs = {}, catalogs = {}) {
  const machines = catalogs.machines || [];

  // --- Inputs ---

  const estimatedScanHours = toNumber(inputs.estimatedScanHours, 0);

  const complexityKey = (inputs.scanComplexity || 'standard').toLowerCase();
  const complexityLevel =
    COMPLEXITY_MAP[complexityKey] ?? COMPLEXITY_MAP.standard;

  const profitMarginPercent = toNumber(inputs.profitMarginPercent, 0);
  const profitMarginDecimal = clamp(profitMarginPercent / 100, 0, 0.99);

  const allowRush = !!inputs.allowRush;
  const laptopUse = !!inputs.laptopUse;

  const electricalCostPerKwh = toNumber(
    inputs.electricalCostPerKwh,
    DEFAULT_ELECTRICAL_COST_PER_KWH
  );
  const basicServiceCostPerHour = toNumber(
    inputs.basicServiceCostPerHour,
    DEFAULT_BASIC_SERVICE_COST_PER_HOUR
  );

  // --- Scan time calculations ---

  const complexityFactor =  (1 + complexityLevel) / 2;
  const effectiveScanHours = estimatedScanHours * complexityFactor;

  let scanTimeDays =
    effectiveScanHours > 0 ? effectiveScanHours / PER_DAY_HOURS : 0;

  let rushScanTimeDays =
    allowRush && effectiveScanHours > 0
      ? effectiveScanHours / PER_DAY_RUSH_HOURS
      : null;

  if (effectiveScanHours > 0) {
    scanTimeDays = Math.max(3, scanTimeDays);
    if (rushScanTimeDays != null) {
      rushScanTimeDays = Math.max(3, rushScanTimeDays);
    }
  }

  // --- Machine (CSV or custom) ---

  const scanMachineId = inputs.scanMachineId;
  const isCustomMachine = scanMachineId === '__custom__';

  let machineAdjustedPrice;
  let machineRoiHours;
  let machinePowerWatts;

  if (isCustomMachine) {
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
      machines.find((m) => String(m.machine_id) === String(scanMachineId)) ||
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

  // --- Costs ---

  // Laptop power cost
  const laptopPowerCost = laptopUse
    ? (ASSUMED_LAPTOP_WATTS * effectiveScanHours * electricalCostPerKwh) / 1000 || 0
    : 0;

  // Machine power cost
  const machinePowerCost =
    (machinePowerWatts * effectiveScanHours * electricalCostPerKwh) / 1000 || 0;

  // Machine amortization cost
  const machineCost =
    (machineAdjustedPrice / machineRoiHours) * effectiveScanHours || 0;

  // Service cost (hours from days)
  const scanHoursConsidered = scanTimeDays * PER_DAY_HOURS;
  const serviceCost = scanHoursConsidered * basicServiceCostPerHour || 0;

  const totalExpense =
    laptopPowerCost + machinePowerCost + machineCost + serviceCost;

  // --- Pricing ---

  const finalSellPrice =
    profitMarginDecimal >= 0.99
      ? totalExpense
      : totalExpense / (1 - profitMarginDecimal);

  const rushFinalSellPrice = allowRush ? finalSellPrice * 1.5 : null;

  const profit = finalSellPrice - totalExpense;

  // Estimated delivery time
  const estimatedDeliveryDays = scanTimeDays;
  const rushEstimatedDeliveryDays = rushScanTimeDays;

  let shownDelivery = allowRush ? rushEstimatedDeliveryDays: estimatedDeliveryDays;
  // --- Sidebar line items ---

  const lineItems = [];

  lineItems.push({
    id: 'scanTimeConsidered',
    label: 'Scan time considered (hours)',
    amount: effectiveScanHours, 
  });
  lineItems.push({
    id: 'laptopPowerCost',
    label: 'Laptop power cost',
    amount: laptopPowerCost,
  });
  lineItems.push({
    id: 'machinePowerCost',
    label: 'Machine power cost',
    amount: machinePowerCost,
  });
  lineItems.push({
    id: 'machineCost',
    label: 'Machine cost',
    amount: machineCost,
  });
  lineItems.push({
    id: 'serviceCost',
    label: 'Service cost',
    amount: serviceCost,
  });
  lineItems.push({
    id: 'totalExpenses',
    label: 'Total expenses',
    amount: totalExpense,
  });
  lineItems.push({
    id: 'profit',
    label: 'Profit',
    amount: profit,
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

  lineItems.push({
    id: 'estimatedDeliveryTime',
    label: 'Estimated delivery time (days)',
    amount: shownDelivery, 
  });

  const subtotal = totalExpense;
  const adjustments = 0;
  const total =
    rushFinalSellPrice != null ? rushFinalSellPrice : finalSellPrice;

  return {
    lineItems,
    subtotal,
    adjustments,
    total,
    meta: {
      complexityLevel,
      effectiveScanHours,
      scanTimeDays,
      rushScanTimeDays,
      estimatedDeliveryDays,
      rushEstimatedDeliveryDays,
      finalSellPrice,
      rushFinalSellPrice,
      totalExpense,
      profit,
      laptopPowerCost,
      machinePowerCost,
      machineCost,
      serviceCost,
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
