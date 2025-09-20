import type { StellariumEngine, CoordinateInfo } from '../types/stellarium';

export const formatInt = (num: number, padLen: number): string => {
  const pad = new Array(1 + padLen).join('0');
  return (pad + num).slice(-pad.length);
};

export const formatRA = (stel: StellariumEngine, a: number): string => {
  const raf = stel.a2tf(a, 1);
  return `<div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.hours, 2)}
    <span class="text-gray-300 font-normal">h</span>&nbsp;</div>
    <div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.minutes, 2)}
    <span class="text-gray-300 font-normal">m</span></div>
    <div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.seconds, 2)}.${raf.fraction}
    <span class="text-gray-300 font-normal">s</span></div>`;
};

export const formatDec = (stel: StellariumEngine, a: number): string => {
  const raf = stel.a2af(a, 1);
  return `<div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${raf.sign}${formatInt(raf.degrees, 2)}
    <span class="text-gray-300 font-normal">°</span></div>
    <div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.arcminutes, 2)}
    <span class="text-gray-300 font-normal">'</span></div>
    <div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.arcseconds, 2)}.${raf.fraction}
    <span class="text-gray-300 font-normal">"</span></div>`;
};

export const formatAz = (stel: StellariumEngine, a: number): string => {
  const raf = stel.a2af(a, 1);
  return `<div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.degrees < 0 ? raf.degrees + 180 : raf.degrees, 3)}
    <span class="text-gray-300 font-normal">°</span></div>
    <div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.arcminutes, 2)}
    <span class="text-gray-300 font-normal">'</span></div>
    <div class="inline-block font-mono pr-0.5 text-sm font-bold">
    ${formatInt(raf.arcseconds, 2)}.${raf.fraction}
    <span class="text-gray-300 font-normal">"</span></div>`;
};

export const getTitle = (obj: any): string => {
  try {
    // Check if obj exists
    if (!obj) {
      return 'No Selection';
    }

    // Check if designations method exists
    if (typeof obj.designations !== 'function') {
      return 'Unknown Object';
    }

    const designations = obj.designations();
    if (!designations || designations.length === 0) {
      return 'Unnamed Object';
    }

    let name = designations[0];
    if (typeof name !== 'string') {
      return 'Invalid Name';
    }

    name = name.replace(/^NAME /, '');
    return name || 'Unnamed Object';
  } catch (error) {
    console.error('Error getting title for object:', error);
    return 'Error Loading Name';
  }
};

export const getProgress = (stel: StellariumEngine) => {
  const bar = stel.core.progressbars[0];
  return { title: bar.label, value: (bar.value / bar.total) * 100 };
};

export const getInfos = (stel: StellariumEngine, obj: any): CoordinateInfo[] => {
  const ret: CoordinateInfo[] = [];
  const obs = stel.core.observer;
  const cirs = stel.convertFrame(obs, 'ICRF', 'CIRS', obj.getInfo('radec'));
  const radec = stel.c2s(cirs);
  const ra = stel.anp(radec[0]);
  const dec = stel.anpm(radec[1]);
  const observed = stel.convertFrame(obs, 'CIRS', 'OBSERVED', cirs);
  const azalt = stel.c2s(observed);
  const az = stel.anp(azalt[0]);
  const alt = stel.anp(azalt[1]);
  const vmag = obj.getInfo('vmag');

  ret.push({
    key: 'Magnitude',
    value: vmag === undefined ? 'Unknown' : vmag.toFixed(2)
  });

  ret.push({
    key: 'Ra/Dec',
    value: formatRA(stel, ra) + '&nbsp;&nbsp;&nbsp;' + formatDec(stel, dec)
  });

  ret.push({
    key: 'Az/Alt',
    value: formatAz(stel, az) + '&nbsp;&nbsp;&nbsp;' + formatDec(stel, alt)
  });

  return ret;
};

export const getBaseUrl = (): string => {
  const url = document.location.href.split('/');
  url.pop();
  return url.join('/') + '/';
};