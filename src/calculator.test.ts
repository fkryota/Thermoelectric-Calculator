import { describe, expect, it } from 'vitest';
import { calculateThermoelectric } from './calculator';

describe('calculateThermoelectric', () => {
  it('calculates PF, ZT, and n-type carrier for negative Seebeck coefficient', () => {
    const result = calculateThermoelectric({
      temperature: '300',
      temperatureUnit: 'K',
      seebeck: '-200',
      seebeckUnit: 'uV/K',
      conductivity: '1000',
      conductivityUnit: 'S/cm',
      thermalConductivity: '1.5',
    });

    expect(result.valid).toBe(true);
    expect(result.outputs?.powerFactorWmK2).toBeCloseTo(0.004);
    expect(result.outputs?.powerFactorMwMK2).toBeCloseTo(4);
    expect(result.outputs?.powerFactorUwCmK2).toBeCloseTo(40);
    expect(result.outputs?.zt).toBeCloseTo(0.8);
    expect(result.outputs?.carrierType).toBe('n-type');
  });

  it('calculates PF, ZT, and p-type carrier for positive Seebeck coefficient', () => {
    const result = calculateThermoelectric({
      temperature: '300',
      temperatureUnit: 'K',
      seebeck: '200',
      seebeckUnit: 'uV/K',
      conductivity: '1000',
      conductivityUnit: 'S/cm',
      thermalConductivity: '1.5',
    });

    expect(result.valid).toBe(true);
    expect(result.outputs?.powerFactorWmK2).toBeCloseTo(0.004);
    expect(result.outputs?.powerFactorMwMK2).toBeCloseTo(4);
    expect(result.outputs?.powerFactorUwCmK2).toBeCloseTo(40);
    expect(result.outputs?.zt).toBeCloseTo(0.8);
    expect(result.outputs?.carrierType).toBe('p-type');
  });

  it('returns the same physical result after equivalent unit changes', () => {
    const base = calculateThermoelectric({
      temperature: '300',
      temperatureUnit: 'K',
      seebeck: '200',
      seebeckUnit: 'uV/K',
      conductivity: '1000',
      conductivityUnit: 'S/cm',
      thermalConductivity: '1.5',
    });
    const equivalent = calculateThermoelectric({
      temperature: '26.85',
      temperatureUnit: 'C',
      seebeck: '0.2',
      seebeckUnit: 'mV/K',
      conductivity: '100000',
      conductivityUnit: 'S/m',
      thermalConductivity: '1.5',
    });

    expect(equivalent.valid).toBe(true);
    expect(equivalent.outputs?.powerFactorWmK2).toBeCloseTo(base.outputs?.powerFactorWmK2 ?? 0);
    expect(equivalent.outputs?.zt).toBeCloseTo(base.outputs?.zt ?? 0);
  });

  it('rejects invalid ranges and reports Japanese field errors', () => {
    const result = calculateThermoelectric({
      temperature: '-274',
      temperatureUnit: 'C',
      seebeck: '100',
      seebeckUnit: 'uV/K',
      conductivity: '-1',
      conductivityUnit: 'S/m',
      thermalConductivity: '0',
    });

    expect(result.valid).toBe(false);
    expect(result.errors.temperature).toContain('0 K or higher');
    expect(result.errors.conductivity).toContain('0 or higher');
    expect(result.errors.thermalConductivity).toContain('greater than 0');
  });
});
