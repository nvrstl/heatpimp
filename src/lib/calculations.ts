import {
  GAS_KWH_PER_M3,
  GAS_CO2_G_PER_KWH,
  ELECTRICITY_CO2_G_PER_KWH,
  BOILER_EFFICIENCY,
  SCOP,
  INSTALLATION_BASE_COST,
  INSTALLATION_COST_PER_M2_ABOVE_BASE,
  INSTALLATION_BASE_M2,
  FLOOR_HEATING_SURCHARGE,
  SUBSIDIES,
  VAT_SAVING_RATE,
  GAS_PRICE_INFLATION,
  ELECTRICITY_PRICE_INFLATION,
  HEAT_PUMP_LIFESPAN_YEARS,
  GREEN_GAS_SURCHARGE_PER_M3,
  GREEN_GAS_SURCHARGE_MAX_PER_M3,
  SOLAR_YIELD_KWH_PER_KWP,
  SOLAR_SELF_CONSUMPTION_RATE,
  FULL_LOAD_HOURS,
  HEAT_LOSS_W_PER_M2,
} from './constants';

export type InsulationLevel = 'poor' | 'moderate' | 'good' | 'excellent';
export type BoilerType = 'old' | 'standard' | 'condensing';
export type Region = 'flanders' | 'brussels' | 'wallonia';
export type IncomeLevel = 'low' | 'middle' | 'high';
export type GasUnit = 'm3' | 'kwh' | 'euros';
export type HeatingType = 'radiators' | 'floorheating' | 'mixed';

export interface FormInputs {
  // Home
  houseSize: number;        // m²
  buildingAge: number;      // year of construction
  insulation: InsulationLevel;
  heatingType: HeatingType;

  // Current heating
  gasUnit: GasUnit;
  gasConsumption: number;   // m³/year, kWh/year, or €/year
  gasPrice: number;         // €/kWh
  boilerType: BoilerType;

  // New system
  electricityPrice: number; // €/kWh

  // Location & subsidies
  region: Region;
  incomeLevel: IncomeLevel;

  // Solar panels (optional)
  solarKwp: number; // 0 = no solar
}

export interface CalculationResults {
  // Heat demand
  annualHeatDemandKwh: number;

  // Current gas costs
  currentAnnualGasCost: number;
  currentAnnualGasKwh: number; // total gas consumed (gross)

  // Heat pump costs
  hpAnnualElecKwh: number;
  hpAnnualElecCost: number;
  hpSCOP: number;

  // Savings
  annualSavings: number;
  annualSavingsPercent: number;

  // Installation
  installationGrossCost: number;
  vatSaving: number;
  subsidyAmount: number;
  netInstallationCost: number;

  // ROI
  paybackYears: number;
  lifetimeSavings: number; // 20 years net savings (after installation)

  // Environment
  currentCO2KgPerYear: number;
  hpCO2KgPerYear: number;
  co2SavedKgPerYear: number;
  co2SavedPercent: number;

  // 20-year chart data
  chartData: ChartDataPoint[];

  // Extra gas cost over 20 years due to green gas blending surcharge
  greenGasSurchargeExtraCost20y: number;

  // Solar
  solarFreeKwhYear: number;   // kWh/year covered for free by solar self-consumption
  solarAnnualSaving: number;  // € saved per year thanks to solar

  // Heat pump sizing
  requiredPowerKw: number;    // recommended HP capacity (kW), average of demand- and area-based methods
}

export interface ChartDataPoint {
  year: number;
  gas: number;      // cumulative cost keeping gas
  hp: number;       // cumulative cost with heat pump (incl. installation)
}

export function calculate(inputs: FormInputs): CalculationResults {
  const {
    houseSize,
    buildingAge,
    insulation,
    heatingType,
    gasUnit,
    gasConsumption,
    gasPrice,
    boilerType,
    electricityPrice,
    region,
    incomeLevel,
    solarKwp,
  } = inputs;

  // 1. Determine annual gas kWh (gross)
  let annualGasKwh: number;
  if (gasUnit === 'm3') {
    annualGasKwh = gasConsumption * GAS_KWH_PER_M3;
  } else if (gasUnit === 'kwh') {
    annualGasKwh = gasConsumption;
  } else {
    // euros → kWh
    annualGasKwh = gasConsumption / gasPrice;
  }

  // 2. Heat demand = what your boiler actually delivers (useful heat)
  const efficiency = BOILER_EFFICIENCY[boilerType];
  const annualHeatDemandKwh = annualGasKwh * efficiency;

  // 3. Current annual gas cost
  const currentAnnualGasCost = annualGasKwh * gasPrice;

  // 4. Heat pump SCOP
  // Adjust SCOP if floor heating vs radiators
  let scop = SCOP[insulation];
  if (heatingType === 'floorheating') scop = Math.min(scop + 0.3, 4.5);
  if (heatingType === 'radiators' && insulation === 'poor') scop = Math.max(scop - 0.2, 2.0);

  // 5. Heat pump electricity use and cost
  const hpAnnualElecKwh = annualHeatDemandKwh / scop;

  // 5b. Solar self-consumption: 35% of yearly yield is "free" electricity
  const solarTotalKwhYear = solarKwp * SOLAR_YIELD_KWH_PER_KWP;
  const solarFreeKwhYear = Math.min(solarTotalKwhYear * SOLAR_SELF_CONSUMPTION_RATE, hpAnnualElecKwh);
  const solarAnnualSaving = solarFreeKwhYear * electricityPrice;

  const hpAnnualElecCost = (hpAnnualElecKwh - solarFreeKwhYear) * electricityPrice;

  // 6. Annual savings
  const annualSavings = currentAnnualGasCost - hpAnnualElecCost;
  const annualSavingsPercent = (annualSavings / currentAnnualGasCost) * 100;

  // 7. Installation cost estimate
  const sizeExtra = Math.max(0, houseSize - INSTALLATION_BASE_M2);
  let installationGrossCost = INSTALLATION_BASE_COST + sizeExtra * INSTALLATION_COST_PER_M2_ABOVE_BASE;

  // Add floor heating surcharge if needed (poor insulation + radiators → recommend floor heating)
  if (heatingType === 'floorheating') {
    installationGrossCost += FLOOR_HEATING_SURCHARGE;
  }

  // 8. VAT reduction (6% instead of 21% = save 15%)
  const buildingIsOld = (new Date().getFullYear() - buildingAge) >= 10;
  const vatSaving = buildingIsOld ? installationGrossCost * VAT_SAVING_RATE : 0;

  // 9. Regional subsidy
  const regionSubsidies = SUBSIDIES[region];
  let subsidyAmount: number;
  if (region === 'flanders') {
    subsidyAmount = (regionSubsidies as typeof SUBSIDIES.flanders)[incomeLevel as 'low' | 'middle' | 'high'];
  } else if (region === 'brussels') {
    const level = incomeLevel === 'low' ? 'low' : 'high';
    subsidyAmount = (regionSubsidies as typeof SUBSIDIES.brussels)[level];
  } else {
    const level = incomeLevel === 'low' ? 'low' : 'high';
    subsidyAmount = (regionSubsidies as typeof SUBSIDIES.wallonia)[level];
  }

  const netInstallationCost = Math.max(0, installationGrossCost - vatSaving - subsidyAmount);

  // 10. Payback period — computed after chartData below

  // 11. CO₂ (HP only uses grid electricity after solar self-consumption)
  const currentCO2KgPerYear = (annualGasKwh * GAS_CO2_G_PER_KWH) / 1000;
  const hpCO2KgPerYear = ((hpAnnualElecKwh - solarFreeKwhYear) * ELECTRICITY_CO2_G_PER_KWH) / 1000;
  const co2SavedKgPerYear = currentCO2KgPerYear - hpCO2KgPerYear;
  const co2SavedPercent = (co2SavedKgPerYear / currentCO2KgPerYear) * 100;

  // 12. 20-year chart data (cumulative costs)
  const chartData: ChartDataPoint[] = [];
  let cumulativeGas = 0;
  let cumulativeHP = netInstallationCost; // HP starts with installation cost
  let gasPrice_ = currentAnnualGasCost;
  let elecCost_ = hpAnnualElecKwh * electricityPrice; // gross, solar deducted separately in loop

  const currentYear = new Date().getFullYear();
  const annualM3 = annualGasKwh / GAS_KWH_PER_M3; // fixed physical volume
  let greenGasSurchargeExtraCost20y = 0;
  let solarSaving_ = solarAnnualSaving; // grows with electricity inflation

  for (let year = 0; year <= HEAT_PUMP_LIFESPAN_YEARS; year++) {
    chartData.push({
      year,
      gas: Math.round(cumulativeGas),
      hp: Math.round(cumulativeHP),
    });
    // Calendar year for which costs are incurred in this iteration
    const calendarYear = currentYear + year + 1;
    const surchargePerM3 = calendarYear >= 2030
      ? GREEN_GAS_SURCHARGE_MAX_PER_M3
      : (GREEN_GAS_SURCHARGE_PER_M3[calendarYear] ?? 0);
    const surchargeCost = surchargePerM3 * annualM3;
    greenGasSurchargeExtraCost20y += surchargeCost;

    gasPrice_ *= (1 + GAS_PRICE_INFLATION);
    elecCost_ *= (1 + ELECTRICITY_PRICE_INFLATION);
    solarSaving_ *= (1 + ELECTRICITY_PRICE_INFLATION);
    cumulativeGas += gasPrice_ + surchargeCost;
    cumulativeHP += elecCost_ - solarSaving_;
  }

  // 10 (continued). Payback — interpolated from actual chart crossover
  let paybackYears = 99;
  for (let i = 1; i < chartData.length; i++) {
    if (chartData[i].hp <= chartData[i].gas) {
      const diffPrev = chartData[i - 1].hp - chartData[i - 1].gas; // positive
      const diffCurr = chartData[i].hp - chartData[i].gas;         // ≤ 0
      paybackYears = (i - 1) + diffPrev / (diffPrev - diffCurr);
      break;
    }
  }

  // 13. Lifetime net savings (gas cumulative - HP cumulative at year 20)
  const lifetimeSavings = chartData[HEAT_PUMP_LIFESPAN_YEARS].gas - chartData[HEAT_PUMP_LIFESPAN_YEARS].hp;

  // 14. Required heat pump power (combined method)
  // Method 1: from annual heat demand ÷ full load hours
  const powerMethod1Kw = annualHeatDemandKwh / FULL_LOAD_HOURS[insulation];
  // Method 3: design heat loss rule of thumb (W/m² × house size)
  const powerMethod3Kw = (HEAT_LOSS_W_PER_M2[insulation] * houseSize) / 1000;
  // Average both methods, round to nearest 0.5 kW
  const requiredPowerKw = Math.round(((powerMethod1Kw + powerMethod3Kw) / 2) * 2) / 2;

  return {
    annualHeatDemandKwh,
    currentAnnualGasCost,
    currentAnnualGasKwh: annualGasKwh,
    hpAnnualElecKwh,
    hpAnnualElecCost,
    hpSCOP: scop,
    annualSavings,
    annualSavingsPercent,
    installationGrossCost,
    vatSaving,
    subsidyAmount,
    netInstallationCost,
    paybackYears,
    lifetimeSavings,
    currentCO2KgPerYear,
    hpCO2KgPerYear,
    co2SavedKgPerYear,
    co2SavedPercent,
    chartData,
    greenGasSurchargeExtraCost20y,
    solarFreeKwhYear,
    solarAnnualSaving,
    requiredPowerKw,
  };
}
