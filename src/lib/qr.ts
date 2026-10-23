/* A small QR code encoder for the check-in codes on /me/registrations, rendered as an inline SVG on the
 * server, so the page needs no package and no script. It covers what the site encodes: byte mode,
 * error correction level M (about 15% of the code can be damaged or covered and it still scans),
 * versions 1 to 10 (up to 213 bytes, far more than a check-in link). The steps follow ISO/IEC 18004:
 * encode the data, add Reed-Solomon error correction per block, interleave the blocks, place the
 * modules, then try all eight masks and keep the one with the lowest penalty. */

// Per version (index 1 to 10), level M: error correction codewords per block and number of blocks.
const ECC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const ALIGN = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
const FORMAT_M = 0b00; // the two error-correction-level bits for M

// Total codewords a version holds: every module that is not a function pattern, in bytes.
const rawModules = (v: number) => {
  let n = (16 * v + 128) * v + 64;
  if (v >= 2) {
    const a = Math.floor(v / 7) + 2;
    n -= (25 * a - 10) * a - 55;
    if (v >= 7) n -= 36;
  }
  return n;
};
const dataCodewords = (v: number) => Math.floor(rawModules(v) / 8) - ECC_PER_BLOCK[v] * BLOCKS[v];

// Reed-Solomon over GF(256) with the QR polynomial 0x11d.
const gfMul = (x: number, y: number) => {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
};
const rsDivisor = (degree: number) => {
  const r = new Array(degree).fill(0);
  r[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfMul(r[j], root);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    root = gfMul(root, 0x02);
  }
  return r;
};
const rsRemainder = (data: number[], divisor: number[]) => {
  const r = divisor.map(() => 0);
  for (const b of data) {
    const factor = b ^ (r.shift() as number);
    r.push(0);
    divisor.forEach((c, i) => (r[i] ^= gfMul(c, factor)));
  }
  return r;
};

// Data bits -> padded codewords -> blocks with error correction, interleaved.
function codewords(bytes: Uint8Array, v: number) {
  const bits: number[] = [];
  const put = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  put(0b0100, 4); // byte mode
  put(bytes.length, v < 10 ? 8 : 16);
  bytes.forEach((b) => put(b, 8));
  const capacity = dataCodewords(v) * 8;
  put(0, Math.min(4, capacity - bits.length)); // terminator
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

  const nBlocks = BLOCKS[v],
    ecLen = ECC_PER_BLOCK[v];
  const shortBlocks = nBlocks - (Math.floor(rawModules(v) / 8) % nBlocks);
  const shortLen = Math.floor(Math.floor(rawModules(v) / 8) / nBlocks);
  const divisor = rsDivisor(ecLen);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < nBlocks; i++) {
    const dat = data.slice(k, k + shortLen - ecLen + (i < shortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, divisor);
    if (i < shortBlocks) dat.push(0); // placeholder so all blocks line up; skipped below
    blocks.push(dat.concat(ecc));
  }
  const out: number[] = [];
  for (let i = 0; i < blocks[0].length; i++)
    blocks.forEach((b, j) => {
      if (i !== shortLen - ecLen || j >= shortBlocks) out.push(b[i]);
    });
  return out;
}

/* Returns the module matrix (true = dark) for the text, at the smallest version that fits. */
export function qrMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  let v = 1;
  while (v <= 10 && dataCodewords(v) < bytes.length + (v < 10 ? 2 : 3)) v++;
  if (v > 10) throw new Error('QR: text too long');
  const size = v * 4 + 17;
  const m: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    m[y][x] = dark;
    fixed[y][x] = true;
  };

  // Finder patterns with their separators, timing patterns, alignment patterns, the dark module.
  for (const [cx, cy] of [
    [3, 3],
    [size - 4, 3],
    [3, size - 4],
  ])
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx,
          y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, d !== 2 && d !== 4);
      }
  for (let i = 0; i < size; i++) {
    if (!fixed[6][i]) set(i, 6, i % 2 === 0);
    if (!fixed[i][6]) set(6, i, i % 2 === 0);
  }
  const al = ALIGN[v];
  for (const ay of al)
    for (const ax of al) {
      if ((ax === 6 && ay === 6) || (ax === 6 && ay === al[al.length - 1]) || (ay === 6 && ax === al[al.length - 1]))
        continue;
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -2; dx <= 2; dx++) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  // Reserve the format and version areas; drawn for real once the mask is chosen.
  const drawFormat = (mask: number) => {
    const data = (FORMAT_M << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0);
  if (v >= 7) {
    let rem = v;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (v << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const dark = ((bits >>> i) & 1) === 1;
      const a = size - 11 + (i % 3),
        b = Math.floor(i / 3);
      set(a, b, dark);
      set(b, a, dark);
    }
  }

  // Data in the zigzag order: two-module columns from the right, upwards then downwards.
  const cw = codewords(bytes, v);
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!fixed[y][x] && i < cw.length * 8) {
          m[y][x] = ((cw[i >>> 3] >>> (7 - (i & 7))) & 1) === 1;
          i++;
        }
      }
  }

  // Try the eight masks and keep the cheapest by the standard's penalty rules.
  const masked = (mask: number) => {
    const out = m.map((row) => row.slice());
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        if (fixed[y][x]) continue;
        const flip = [
          (x + y) % 2 === 0,
          y % 2 === 0,
          x % 3 === 0,
          (x + y) % 3 === 0,
          (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
          ((x * y) % 2) + ((x * y) % 3) === 0,
          (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
          (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
        ][mask];
        if (flip) out[y][x] = !out[y][x];
      }
    return out;
  };
  const penalty = (g: boolean[][]) => {
    let p = 0;
    const line = (get: (a: number, b: number) => boolean) => {
      for (let a = 0; a < size; a++) {
        let run = 1;
        const seq: number[] = [];
        for (let b = 0; b < size; b++) seq.push(get(a, b) ? 1 : 0);
        for (let b = 1; b <= size; b++) {
          if (b < size && seq[b] === seq[b - 1]) run++;
          else {
            if (run >= 5) p += run - 2;
            run = 1;
          }
        }
        const s = seq.join('');
        for (const pat of ['10111010000', '00001011101']) {
          let k = s.indexOf(pat);
          while (k !== -1) {
            p += 40;
            k = s.indexOf(pat, k + 1);
          }
        }
      }
    };
    line((a, b) => g[a][b]);
    line((a, b) => g[b][a]);
    let dark = 0;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        if (g[y][x]) dark++;
        if (
          x < size - 1 &&
          y < size - 1 &&
          g[y][x] === g[y][x + 1] &&
          g[y][x] === g[y + 1][x] &&
          g[y][x] === g[y + 1][x + 1]
        )
          p += 3;
      }
    p += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    return p;
  };
  let best: boolean[][] = m,
    bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    drawFormat(mask);
    const g = masked(mask);
    const score = penalty(g);
    if (score < bestScore) {
      best = g;
      bestScore = score;
    }
  }
  return best;
}

/* The code as a scalable SVG: one path, a four-module quiet zone, dark modules in currentColor-free
 * black on white so it scans whatever the site theme. */
export function qrSvg(text: string, label = 'QR code'): string {
  const g = qrMatrix(text);
  const n = g.length,
    q = 4;
  let d = '';
  g.forEach((row, y) => row.forEach((on, x) => on && (d += `M${x + q} ${y + q}h1v1h-1z`)));
  const s = n + q * 2;
  const esc = label.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges" role="img" aria-label="${esc}"><rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}
