import { Resvg } from '@resvg/resvg-js';

export const SEAL_PATH =
  'M12 2.5l2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.6 1.1 2.5-1.9 1.9-.2 2.7-2.6.6-1.6 2.2-2.4-1.2-2.4 1.2-1.6-2.2-2.6-.6-.2-2.7L3.3 15l1.1-2.5-.6-2.6 2.3-1.4 1-2.5 2.7.2z';
export const CHECK_PATH = 'M8.2 12.4l2.5 2.4 5-5.4';

export function iconSvg(bleed = false) {
  const scale = bleed ? 1.55 : 2.1;
  const offset = (64 - 24 * scale) / 2;
  const rx = bleed ? 0 : 15;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="#111111"/><g transform="translate(${offset} ${offset}) scale(${scale})"><path d="${SEAL_PATH}" fill="#ffffff"/><path d="${CHECK_PATH}" stroke="#111111" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
}

export const svgToPng = (svg: string, size: number) => new Uint8Array(new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng());

export function ico(sizes: number[]) {
  const pngs = sizes.map((size) => ({ size, data: svgToPng(iconSvg(), size) }));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const entries = pngs.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size % 256, 0);
    e.writeUInt8(size % 256, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}
