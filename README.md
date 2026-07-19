# Thermoelectric Calculator

A smartphone-friendly PWA for calculating the thermoelectric power factor and dimensionless figure of merit ZT from temperature, Seebeck coefficient, electrical conductivity, and thermal conductivity.

## Features

- Automatic calculation as inputs change
- Unit conversion for temperature, Seebeck coefficient, and electrical conductivity
- Power factor output in `W/(m·K²)`, `mW/(m·K²)`, and `µW/(cm·K²)`
- Dimensionless ZT output with prominent display
- Carrier type display: `p-type`, `n-type`, or `undetermined`
- Input validation for invalid, incomplete, infinite, and out-of-range values
- Clipboard copy for calculated results
- Reset button
- Local input persistence with `localStorage`
- Offline-capable PWA with install support
- Responsive layout for Android Chrome and iPhone Safari
- Dark mode support

## Calculation

All inputs are converted to SI units before calculation.

```text
PF = S²σ
ZT = S²σT/κ
```

Where:

- `S`: Seebeck coefficient `[V/K]`
- `σ`: electrical conductivity `[S/m]`
- `T`: absolute temperature `[K]`
- `κ`: thermal conductivity `[W/(m·K)]`

## Development

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## PWA Notes

The app includes a web app manifest and service worker. After deployment over HTTPS, supported mobile browsers can install it to the home screen and use cached assets offline.

## Font

Formula text uses the bundled Latin Modern Math web font.
