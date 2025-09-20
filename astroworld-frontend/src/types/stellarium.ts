// TypeScript interfaces for Stellarium Web Engine

export interface StellariumObject {
  [key: string]: any;
  visible?: boolean;
  lines_visible?: boolean;
  designations(): string[];
  getInfo(key: string): any;
}

export interface ProgressBar {
  label: string;
  value: number;
  total: number;
}

export interface StellariumCore {
  progressbars: ProgressBar[];
  selection: any; // More flexible type for selection
  observer: any;
  constellations: StellariumObject;
  atmosphere: StellariumObject;
  landscapes: StellariumObject;
  lines: {
    azimuthal: StellariumObject;
    equatorial: StellariumObject;
  };
  dsos: StellariumObject;
  dss: StellariumObject;
  stars: StellariumObject & {
    addDataSource(options: { url: string }): void;
  };
  skycultures: StellariumObject & {
    addDataSource(options: { url: string; key: string }): void;
  };
  milkyway: StellariumObject & {
    addDataSource(options: { url: string }): void;
  };
  minor_planets: StellariumObject & {
    addDataSource(options: { url: string; key: string }): void;
  };
  planets: StellariumObject & {
    addDataSource(options: { url: string; key: string }): void;
  };
  comets: StellariumObject & {
    addDataSource(options: { url: string; key: string }): void;
  };
  satellites: StellariumObject & {
    addDataSource(options: { url: string; key: string }): void;
  };
}

export interface StellariumEngine {
  core: StellariumCore;
  change(callback: (obj: any, attr: string) => void): void;
  setFont(name: string, url: string, scale: number): void;
  a2tf(angle: number, precision: number): {
    hours: number;
    minutes: number;
    seconds: number;
    fraction: number;
  };
  a2af(angle: number, precision: number): {
    sign: string;
    degrees: number;
    arcminutes: number;
    arcseconds: number;
    fraction: number;
  };
  anp(angle: number): number;
  anpm(angle: number): number;
  c2s(vector: number[]): number[];
  convertFrame(observer: any, from: string, to: string, coords: any): any;
}

export interface StelWebEngineOptions {
  wasmFile: string;
  canvas: HTMLCanvasElement;
  translateFn?: (domain: string, str: string) => string;
  onReady: (stel: StellariumEngine) => void;
}

export interface CoordinateInfo {
  key: string;
  value: string;
}

declare global {
  function StelWebEngine(options: StelWebEngineOptions): void;
  
  namespace i18next {
    function use(backend: any): typeof i18next;
    function init(options: any): Promise<any>;
    function t(key: string, options?: { ns: string }): string;
  }
  
  const i18nextXHRBackend: any;
}