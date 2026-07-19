export type TemperatureUnit = 'K' | 'C';
export type SeebeckUnit = 'uV/K' | 'mV/K' | 'V/K';
export type ConductivityUnit = 'S/cm' | 'S/m';
export type CarrierType = 'p-type' | 'n-type' | 'undetermined';

export type CalculatorInput = {
  temperature: string;
  temperatureUnit: TemperatureUnit;
  seebeck: string;
  seebeckUnit: SeebeckUnit;
  conductivity: string;
  conductivityUnit: ConductivityUnit;
  thermalConductivity: string;
};

export type CalculatorErrors = Partial<Record<keyof CalculatorInput, string>>;

export type CalculatorResult = {
  valid: boolean;
  incomplete: boolean;
  errors: CalculatorErrors;
  si?: {
    temperatureK: number;
    seebeckVK: number;
    conductivitySM: number;
    thermalConductivity: number;
  };
  outputs?: {
    powerFactorWmK2: number;
    powerFactorMwMK2: number;
    powerFactorUwCmK2: number;
    zt: number;
    carrierType: CarrierType;
  };
};

const seebeckFactor: Record<SeebeckUnit, number> = {
  'uV/K': 1e-6,
  'mV/K': 1e-3,
  'V/K': 1,
};

const conductivityFactor: Record<ConductivityUnit, number> = {
  'S/cm': 100,
  'S/m': 1,
};

const isFiniteNumber = (value: number): boolean => Number.isFinite(value) && !Number.isNaN(value);

const parseRequiredNumber = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined;
  const value = Number(raw);
  return isFiniteNumber(value) ? value : Number.NaN;
};

export function getCarrierType(seebeckVK: number): CarrierType {
  if (seebeckVK > 0) return 'p-type';
  if (seebeckVK < 0) return 'n-type';
  return 'undetermined';
}

export function calculateThermoelectric(input: CalculatorInput): CalculatorResult {
  const errors: CalculatorErrors = {};
  const rawTemperature = parseRequiredNumber(input.temperature);
  const rawSeebeck = parseRequiredNumber(input.seebeck);
  const rawConductivity = parseRequiredNumber(input.conductivity);
  const rawThermalConductivity = parseRequiredNumber(input.thermalConductivity);

  const incomplete =
    rawTemperature === undefined ||
    rawSeebeck === undefined ||
    rawConductivity === undefined ||
    rawThermalConductivity === undefined;

  if (incomplete) return { valid: false, incomplete: true, errors };

  if (!isFiniteNumber(rawTemperature)) {
    errors.temperature = 'Enter a valid number.';
  }
  if (!isFiniteNumber(rawSeebeck)) {
    errors.seebeck = 'Enter a valid number.';
  }
  if (!isFiniteNumber(rawConductivity)) {
    errors.conductivity = 'Enter a valid number.';
  }
  if (!isFiniteNumber(rawThermalConductivity)) {
    errors.thermalConductivity = 'Enter a valid number.';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, incomplete: false, errors };
  }

  const temperatureK = input.temperatureUnit === 'C' ? rawTemperature + 273.15 : rawTemperature;
  const seebeckVK = rawSeebeck * seebeckFactor[input.seebeckUnit];
  const conductivitySM = rawConductivity * conductivityFactor[input.conductivityUnit];
  const thermalConductivity = rawThermalConductivity;

  if (temperatureK < 0) {
    errors.temperature = 'Absolute temperature must be 0 K or higher.';
  }
  if (conductivitySM < 0) {
    errors.conductivity = 'Electrical conductivity must be 0 or higher.';
  }
  if (thermalConductivity <= 0) {
    errors.thermalConductivity = 'Thermal conductivity must be greater than 0.';
  }

  const convertedValues = [temperatureK, seebeckVK, conductivitySM, thermalConductivity];
  if (convertedValues.some((value) => !isFiniteNumber(value))) {
    if (!errors.temperature && !isFiniteNumber(temperatureK)) {
      errors.temperature = 'The converted temperature is too large.';
    }
    if (!errors.seebeck && !isFiniteNumber(seebeckVK)) {
      errors.seebeck = 'The converted Seebeck coefficient is too large.';
    }
    if (!errors.conductivity && !isFiniteNumber(conductivitySM)) {
      errors.conductivity = 'The converted electrical conductivity is too large.';
    }
    if (!errors.thermalConductivity && !isFiniteNumber(thermalConductivity)) {
      errors.thermalConductivity = 'Thermal conductivity is too large.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, incomplete: false, errors };
  }

  const powerFactorWmK2 = seebeckVK ** 2 * conductivitySM;
  const zt = (powerFactorWmK2 * temperatureK) / thermalConductivity;
  const powerFactorMwMK2 = powerFactorWmK2 * 1000;
  const powerFactorUwCmK2 = powerFactorWmK2 * 10000;
  const outputs = [powerFactorWmK2, powerFactorMwMK2, powerFactorUwCmK2, zt];

  if (outputs.some((value) => !isFiniteNumber(value))) {
    return {
      valid: false,
      incomplete: false,
      errors: {
        seebeck: 'The calculated result is too large. Check the input values.',
      },
    };
  }

  return {
    valid: true,
    incomplete: false,
    errors,
    si: {
      temperatureK,
      seebeckVK,
      conductivitySM,
      thermalConductivity,
    },
    outputs: {
      powerFactorWmK2,
      powerFactorMwMK2,
      powerFactorUwCmK2,
      zt,
      carrierType: getCarrierType(seebeckVK),
    },
  };
}

export function formatNumber(value: number): string {
  const abs = Math.abs(value);
  if (value === 0) return '0';
  if (abs >= 1e5 || abs < 1e-4) return value.toExponential(4);
  return new Intl.NumberFormat('en-US', {
    maximumSignificantDigits: 6,
  }).format(value);
}
