// TypeScript interfaces for Stellarium Web Engine

// TypeScript interfaces for Stellarium Web Engine

export interface StellariumObject {
  [key: string]: unknown;
  visible?: boolean;
  lines_visible?: boolean;
  images_visible?: boolean;
  designations(): string[];
  getInfo(key: string): unknown;
  type?: string;
  designation?: string;
  catalog_number?: string;
  name?: string;
  icrs_pos?: {
    ra: number;
    dec: number;
  };
  coordinates?: unknown;
  horizontal_pos?: number[] | (() => number[]) | { alt: number; az: number };
  magnitude?: number;
  jsonData?: unknown | (() => unknown);
  addDataSource?: (options: { url: string; key?: string }) => void;
}

export interface ProgressBar {
  label: string;
  value: number;
  total: number;
}

export interface StellariumCore {
  progressbars: ProgressBar[];
  selection: StellariumObject | null;
  observer: {
    utc_to_local_tz: number;
    latitude: number;
    longitude: number;
    elevation: number;
    time: number;
    fov?: number;
    set_direction?: (direction: number[]) => void;
    set_azimuthal?: (azimuth: number, altitude: number) => void;
    set_zoom?: (zoom: number) => void;
  };
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
  getObjAtPos?: (x: number, y: number) => StellariumObject | null;
  update?: (deltaTime: number) => void;
}

export interface StellariumEngine {
  core: StellariumCore;
  change(callback: (obj: StellariumObject | null, attr: string) => void): void;
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
  convertFrame(observer: unknown, from: string, to: string, coords: unknown): unknown;
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