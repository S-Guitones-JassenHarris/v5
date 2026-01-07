// src/service-types/wash-cure/calculator.js

// Calculator for Wash & Cure service

const PER_DAY_HOURS = 8;
const PER_DAY_RUSH_HOURS = 10;

const DEFAULT_ELECTRICAL_COST_PER_KWH = 13.5;
const DEFAULT_BASIC_SERVICE_COST_PER_HOUR = 500;

const DEFAULT_BATCH_COUNT = 1;
const DEFAULT_CUSTOM_MACHINE_ROI_HOURS = 2190;
const DEFAULT_MACHINE_ROI_HOURS_FALLBACK = 2190;
const CUSTOM_MACHINE_VAT_FACTOR = 1.12;

export function calculateWashCureQuote(inputs = {}, catalogs = {}) {
  const machines = catalogs.machines || [];

  // Core inputs
  const handleTimePerBatchMinutes = toNumber(
    inputs.handleTimePerBatchMinutes,
    0
  );
  const washTimeMinutes = toNumber(inputs.washTimeMinutes, 0);
  const cureTimeMinutes = toNumber(inputs.cureTimeMinutes, 0);

  const washMachineId = inputs.washMachineId;
  const cureMachineId = inputs.cureMachineId;

  const profitMarginPercent = toNumber(inputs.profitMarginPercent, 0);
  const profitMarginDecimal = clamp(profitMarginPercent / 100, 0, 0.99);

  const allowRush = !!inputs.allowRush;

  const cureBatchCount = toNumber(
    inputs.cureBatchCount,
    DEFAULT_BATCH_COUNT
  );

   const washBatchCount = toNumber(
    inputs.washBatchCount,
    DEFAULT_BATCH_COUNT
  );
  const electricalCostPerKwh = toNumber(
    inputs.electricalCostPerKwh,
    DEFAULT_ELECTRICAL_COST_PER_KWH
  );
  const basicServiceCostPerHour = toNumber(
    inputs.basicServiceCostPerHour,
    DEFAULT_BASIC_SERVICE_COST_PER_HOUR
  );

  // Machine helpers
  function getMachineData(machineId, customPrefix) {
    const isCustom = machineId === '__custom__';

    if (isCustom) {
      const customPrice = toNumber(inputs[`${customPrefix}PricePhp`], 0);
      const adjusted =
        customPrice > 0 ? customPrice / CUSTOM_MACHINE_VAT_FACTOR : 0;

      const roiHours = toNumber(
        inputs[`${customPrefix}RoiHours`],
        DEFAULT_CUSTOM_MACHINE_ROI_HOURS
      );
      const powerWatts = toNumber(
        inputs[`${customPrefix}PowerWatts`],
        0
      );

      return {
        adjustedPrice: adjusted,
        roiHours,
        powerWatts,
      };
    }

    const selected =
      machines.find((m) => String(m.machine_id) === String(machineId)) ||
      null;

    const adjustedPrice = selected
      ? toNumber(selected.adjusted_machine_price_php, 0)
      : 0;
    const roiHours = selected
      ? toNumber(
          selected.roi_hours,
          DEFAULT_MACHINE_ROI_HOURS_FALLBACK
        )
      : DEFAULT_MACHINE_ROI_HOURS_FALLBACK;
    const powerWatts = selected ? toNumber(selected.power_watts, 0) : 0;

    return {
      adjustedPrice,
      roiHours,
      powerWatts,
    };
  }

  const washMachine = getMachineData(washMachineId, 'customWashMachine');
  const cureMachine = getMachineData(cureMachineId, 'customCureMachine');

  // Time calculations
  const totalServiceTimeMinutes = washBatchCount > cureBatchCount? handleTimePerBatchMinutes * washBatchCount: handleTimePerBatchMinutes * cureBatchCount ;

  const totalMachineTimeMinutes =
    (washTimeMinutes * washBatchCount) + (cureTimeMinutes * cureBatchCount);

  // Machine costs
  const washMachineCost =
    ((washTimeMinutes * washBatchCount) *
      washMachine.adjustedPrice) /
      (washMachine.roiHours * 60) || 0;

  const cureMachineCost =
    ((cureTimeMinutes * cureBatchCount) *
      cureMachine.adjustedPrice) /
      (cureMachine.roiHours * 60) || 0;

  // Power costs
  const washMachinePowerCost =
    ((washTimeMinutes * washBatchCount) *
      electricalCostPerKwh *
      washMachine.powerWatts) /
      (60 * 1000) || 0;

  const cureMachinePowerCost =
    ((cureTimeMinutes * cureBatchCount) *
      electricalCostPerKwh *
      cureMachine.powerWatts) /
      (60 * 1000) || 0;

  // Service cost
  const serviceCost =
    (totalServiceTimeMinutes * basicServiceCostPerHour) / 60 || 0;

  // Total expense
  const totalExpense =
    serviceCost +
    washMachineCost +
    cureMachineCost +
    washMachinePowerCost +
    cureMachinePowerCost;

  // Pricing
  const finalSellPrice =
    profitMarginDecimal >= 0.99
      ? totalExpense
      : totalExpense / (1 - profitMarginDecimal);

  const rushFinalSellPrice = allowRush ? finalSellPrice * 1.5 : null;

  const profit = finalSellPrice - totalExpense;

  // Delivery time in days
  const totalMinutesForDelivery =
    totalMachineTimeMinutes + totalServiceTimeMinutes;

  let deliveryDays =
    totalMinutesForDelivery > 0
      ? totalMinutesForDelivery / (60 * PER_DAY_HOURS)
      : 0;

  let rushDeliveryDays =
    allowRush && totalMinutesForDelivery > 0
      ? totalMinutesForDelivery / (60 * PER_DAY_RUSH_HOURS)
      : null;

  if (totalMinutesForDelivery > 0) {
    deliveryDays = Math.max(3, deliveryDays);
    if (rushDeliveryDays != null) {
      rushDeliveryDays = Math.max(3, rushDeliveryDays);
    }
  }

  // Sidebar line items
  const lineItems = [];

  lineItems.push({
    id: 'totalServiceTime',
    label: 'Total service time (minutes)',
    amount: totalServiceTimeMinutes,
  });
  lineItems.push({
    id: 'totalMachineTime',
    label: 'Total machine time (minutes)',
    amount: totalMachineTimeMinutes,
  });
  lineItems.push({
    id: 'washMachineCost',
    label: 'Wash machine cost',
    amount: washMachineCost,
  });
  lineItems.push({
    id: 'cureMachineCost',
    label: 'Cure machine cost',
    amount: cureMachineCost,
  });
  lineItems.push({
    id: 'washMachinePowerCost',
    label: 'Wash machine power cost',
    amount: washMachinePowerCost,
  });
  lineItems.push({
    id: 'cureMachinePowerCost',
    label: 'Cure machine power cost',
    amount: cureMachinePowerCost,
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
    id: 'deliveryTime',
    label: 'Delivery time (days)',
    amount: 0, // use meta.deliveryDays
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
      totalServiceTimeMinutes,
      totalMachineTimeMinutes,
      deliveryDays,
      rushDeliveryDays,
      finalSellPrice,
      rushFinalSellPrice,
      totalExpense,
      profit,
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
