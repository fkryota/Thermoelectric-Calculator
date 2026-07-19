import './style.css';
import {
  calculateThermoelectric,
  type CalculatorInput,
  formatNumber,
  type CarrierType,
} from './calculator';

const STORAGE_KEY = 'thermoelectric-calculator-input-v1';

const defaultInput: CalculatorInput = {
  temperature: '300',
  temperatureUnit: 'K',
  seebeck: '-200',
  seebeckUnit: 'uV/K',
  conductivity: '1000',
  conductivityUnit: 'S/cm',
  thermalConductivity: '1.5',
};

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('App root was not found.');
}

app.innerHTML = `
  <section class="shell" aria-labelledby="app-title">
    <header class="topbar">
      <div>
        <p class="eyebrow">PF / ZT</p>
        <h1 id="app-title">Thermoelectric Calculator</h1>
      </div>
      <button class="icon-button" id="reset-button" type="button" aria-label="Reset inputs" title="Reset">
        <span aria-hidden="true">↺</span>
      </button>
    </header>

    <section class="formula-strip" aria-label="Formulas">
      <span><span class="math-roman">PF</span> = <var>S</var><sup>2</sup><var>σ</var></span>
      <span><var>ZT</var> = <var>S</var><sup>2</sup><var>σT</var>/<var>κ</var></span>
    </section>

    <section class="card input-card" aria-labelledby="input-title">
      <h2 id="input-title">Inputs</h2>
      <div class="field-group">
        <label for="temperature">Temperature</label>
        <div class="input-row">
          <input id="temperature" name="temperature" type="number" inputmode="decimal" step="any" />
          <select id="temperatureUnit" name="temperatureUnit" aria-label="Temperature unit">
            <option value="K">K</option>
            <option value="C">°C</option>
          </select>
        </div>
        <p class="error" id="temperature-error" aria-live="polite"></p>
      </div>

      <div class="field-group">
        <label for="seebeck">Seebeck coefficient</label>
        <div class="input-row">
          <input id="seebeck" name="seebeck" type="number" inputmode="decimal" step="any" />
          <select id="seebeckUnit" name="seebeckUnit" aria-label="Seebeck coefficient unit">
            <option value="uV/K">µV/K</option>
            <option value="mV/K">mV/K</option>
            <option value="V/K">V/K</option>
          </select>
        </div>
        <p class="error" id="seebeck-error" aria-live="polite"></p>
      </div>

      <div class="field-group">
        <label for="conductivity">Electrical conductivity</label>
        <div class="input-row">
          <input id="conductivity" name="conductivity" type="number" inputmode="decimal" step="any" min="0" />
          <select id="conductivityUnit" name="conductivityUnit" aria-label="Electrical conductivity unit">
            <option value="S/cm">S/cm</option>
            <option value="S/m">S/m</option>
          </select>
        </div>
        <p class="error" id="conductivity-error" aria-live="polite"></p>
      </div>

      <div class="field-group">
        <label for="thermalConductivity">Thermal conductivity</label>
        <div class="input-row single-unit">
          <input
            id="thermalConductivity"
            name="thermalConductivity"
            type="number"
            inputmode="decimal"
            step="any"
            min="0"
          />
          <span class="unit-pill">W/(m·K)</span>
        </div>
        <p class="error" id="thermalConductivity-error" aria-live="polite"></p>
      </div>
    </section>

    <section class="card result-card" aria-labelledby="result-title">
      <div class="result-header">
        <h2 id="result-title">Results</h2>
        <button class="copy-button" id="copy-button" type="button">Copy</button>
      </div>

      <div class="zt-panel">
        <span class="result-label zt-symbol">ZT</span>
        <output class="zt-value" id="zt-output">—</output>
        <span class="dimensionless">dimensionless</span>
      </div>

      <div class="carrier" id="carrier-output">
        <span class="carrier-mark" aria-hidden="true">•</span>
        <span>carrier type: —</span>
      </div>

      <dl class="result-grid">
        <div>
          <dt>PF</dt>
          <dd><output id="pf-w-output">—</output><span> W/(m·K²)</span></dd>
        </div>
        <div>
          <dt>PF</dt>
          <dd><output id="pf-mw-output">—</output><span> mW/(m·K²)</span></dd>
        </div>
        <div>
          <dt>PF</dt>
          <dd><output id="pf-uw-output">—</output><span> µW/(cm·K²)</span></dd>
        </div>
      </dl>

      <p class="copy-status" id="copy-status" aria-live="polite"></p>
    </section>
  </section>
`;

const fields = {
  temperature: document.querySelector<HTMLInputElement>('#temperature'),
  temperatureUnit: document.querySelector<HTMLSelectElement>('#temperatureUnit'),
  seebeck: document.querySelector<HTMLInputElement>('#seebeck'),
  seebeckUnit: document.querySelector<HTMLSelectElement>('#seebeckUnit'),
  conductivity: document.querySelector<HTMLInputElement>('#conductivity'),
  conductivityUnit: document.querySelector<HTMLSelectElement>('#conductivityUnit'),
  thermalConductivity: document.querySelector<HTMLInputElement>('#thermalConductivity'),
};

const errors = {
  temperature: document.querySelector<HTMLParagraphElement>('#temperature-error'),
  seebeck: document.querySelector<HTMLParagraphElement>('#seebeck-error'),
  conductivity: document.querySelector<HTMLParagraphElement>('#conductivity-error'),
  thermalConductivity: document.querySelector<HTMLParagraphElement>('#thermalConductivity-error'),
};

const outputs = {
  zt: document.querySelector<HTMLOutputElement>('#zt-output'),
  pfW: document.querySelector<HTMLOutputElement>('#pf-w-output'),
  pfMw: document.querySelector<HTMLOutputElement>('#pf-mw-output'),
  pfUw: document.querySelector<HTMLOutputElement>('#pf-uw-output'),
  carrier: document.querySelector<HTMLDivElement>('#carrier-output'),
  copyStatus: document.querySelector<HTMLParagraphElement>('#copy-status'),
};

const copyButton = document.querySelector<HTMLButtonElement>('#copy-button');
const resetButton = document.querySelector<HTMLButtonElement>('#reset-button');

const requireElement = <T extends Element>(element: T | null): T => {
  if (!element) throw new Error('Required UI element was not found.');
  return element;
};

const ui = {
  fields: {
    temperature: requireElement(fields.temperature),
    temperatureUnit: requireElement(fields.temperatureUnit),
    seebeck: requireElement(fields.seebeck),
    seebeckUnit: requireElement(fields.seebeckUnit),
    conductivity: requireElement(fields.conductivity),
    conductivityUnit: requireElement(fields.conductivityUnit),
    thermalConductivity: requireElement(fields.thermalConductivity),
  },
  errors: {
    temperature: requireElement(errors.temperature),
    seebeck: requireElement(errors.seebeck),
    conductivity: requireElement(errors.conductivity),
    thermalConductivity: requireElement(errors.thermalConductivity),
  },
  outputs: {
    zt: requireElement(outputs.zt),
    pfW: requireElement(outputs.pfW),
    pfMw: requireElement(outputs.pfMw),
    pfUw: requireElement(outputs.pfUw),
    carrier: requireElement(outputs.carrier),
    copyStatus: requireElement(outputs.copyStatus),
  },
  copyButton: requireElement(copyButton),
  resetButton: requireElement(resetButton),
};

const readStoredInput = (): CalculatorInput => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultInput;
    return { ...defaultInput, ...JSON.parse(stored) } as CalculatorInput;
  } catch {
    return defaultInput;
  }
};

const getInput = (): CalculatorInput => ({
  temperature: ui.fields.temperature.value,
  temperatureUnit: ui.fields.temperatureUnit.value as CalculatorInput['temperatureUnit'],
  seebeck: ui.fields.seebeck.value,
  seebeckUnit: ui.fields.seebeckUnit.value as CalculatorInput['seebeckUnit'],
  conductivity: ui.fields.conductivity.value,
  conductivityUnit: ui.fields.conductivityUnit.value as CalculatorInput['conductivityUnit'],
  thermalConductivity: ui.fields.thermalConductivity.value,
});

const setInput = (input: CalculatorInput): void => {
  ui.fields.temperature.value = input.temperature;
  ui.fields.temperatureUnit.value = input.temperatureUnit;
  ui.fields.seebeck.value = input.seebeck;
  ui.fields.seebeckUnit.value = input.seebeckUnit;
  ui.fields.conductivity.value = input.conductivity;
  ui.fields.conductivityUnit.value = input.conductivityUnit;
  ui.fields.thermalConductivity.value = input.thermalConductivity;
};

const setOutputDash = (): void => {
  ui.outputs.zt.textContent = '—';
  ui.outputs.pfW.textContent = '—';
  ui.outputs.pfMw.textContent = '—';
  ui.outputs.pfUw.textContent = '—';
  ui.outputs.carrier.className = 'carrier';
  ui.outputs.carrier.innerHTML =
    '<span class="carrier-mark" aria-hidden="true">•</span><span>carrier type: —</span>';
};

const setCarrier = (carrierType: CarrierType): void => {
  const labels: Record<CarrierType, string> = {
    'p-type': 'carrier type: p-type',
    'n-type': 'carrier type: n-type',
    undetermined: 'carrier type: undetermined',
  };

  ui.outputs.carrier.className = `carrier ${carrierType.replace('-', '')}`;
  ui.outputs.carrier.innerHTML = `<span class="carrier-mark" aria-hidden="true">${
    carrierType === 'p-type' ? '+' : carrierType === 'n-type' ? '−' : '0'
  }</span><span>${labels[carrierType]}</span>`;
};

const render = (): void => {
  const input = getInput();
  const result = calculateThermoelectric(input);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(input));

  Object.entries(ui.errors).forEach(([key, element]) => {
    const inputElement = ui.fields[key as keyof typeof ui.errors];
    const message = result.errors[key as keyof typeof result.errors] ?? '';
    element.textContent = message;
    inputElement.setAttribute('aria-invalid', message ? 'true' : 'false');
  });

  if (!result.valid || !result.outputs) {
    setOutputDash();
    return;
  }

  ui.outputs.zt.textContent = formatNumber(result.outputs.zt);
  ui.outputs.pfW.textContent = formatNumber(result.outputs.powerFactorWmK2);
  ui.outputs.pfMw.textContent = formatNumber(result.outputs.powerFactorMwMK2);
  ui.outputs.pfUw.textContent = formatNumber(result.outputs.powerFactorUwCmK2);
  setCarrier(result.outputs.carrierType);
};

const copyResults = async (): Promise<void> => {
  const result = calculateThermoelectric(getInput());
  if (!result.valid || !result.outputs) {
    ui.outputs.copyStatus.textContent = 'No valid results to copy.';
    return;
  }

  const text = [
    'Thermoelectric Calculator',
    `PF = ${formatNumber(result.outputs.powerFactorWmK2)} W/(m·K²)`,
    `PF = ${formatNumber(result.outputs.powerFactorMwMK2)} mW/(m·K²)`,
    `PF = ${formatNumber(result.outputs.powerFactorUwCmK2)} µW/(cm·K²)`,
    `ZT = ${formatNumber(result.outputs.zt)}`,
    `carrier type = ${result.outputs.carrierType}`,
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
    ui.outputs.copyStatus.textContent = 'Results copied to clipboard.';
  } catch {
    ui.outputs.copyStatus.textContent = 'Copy failed. Check your browser permissions.';
  }
};

setInput(readStoredInput());
render();

Object.values(ui.fields).forEach((field) => {
  field.addEventListener('input', render);
  field.addEventListener('change', render);
});

ui.copyButton.addEventListener('click', () => {
  void copyResults();
});

ui.resetButton.addEventListener('click', () => {
  setInput(defaultInput);
  ui.outputs.copyStatus.textContent = '';
  render();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  });
}
