/* Small raw-DEFLATE decoder (RFC 1951), used only when the browser has no
 * DecompressionStream("deflate-raw") — e.g. older Android WebViews.
 *   const bytes = Inflate.raw(uint8array);
 */
(function () {
  "use strict";

  const LEN_BASE = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const LEN_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const DIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  const CL_ORDER = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];

  // Canonical Huffman table: counts per bit length + symbols sorted by code.
  function build(lengths) {
    const counts = new Uint16Array(16), offs = new Uint16Array(16);
    for (const l of lengths) counts[l]++;
    counts[0] = 0;
    for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + counts[i - 1];
    const symbols = new Uint16Array(lengths.length);
    lengths.forEach((l, s) => { if (l) symbols[offs[l]++] = s; });
    return { counts, symbols };
  }

  let FIXED_LIT, FIXED_DIST;
  function fixed() {
    if (!FIXED_LIT) {
      const l = new Uint8Array(288);
      l.fill(8, 0, 144); l.fill(9, 144, 256); l.fill(7, 256, 280); l.fill(8, 280, 288);
      FIXED_LIT = build(l);
      FIXED_DIST = build(new Uint8Array(30).fill(5));
    }
  }

  function raw(src) {
    let pos = 0, bitBuf = 0, bitCnt = 0;
    let out = new Uint8Array(Math.max(1024, src.length * 4)), outLen = 0;

    const ensure = n => {
      if (outLen + n <= out.length) return;
      let size = out.length * 2;
      while (size < outLen + n) size *= 2;
      const next = new Uint8Array(size); next.set(out.subarray(0, outLen)); out = next;
    };
    const bits = n => {
      while (bitCnt < n) {
        if (pos >= src.length) throw new Error("Unexpected end of compressed data");
        bitBuf |= src[pos++] << bitCnt; bitCnt += 8;
      }
      const v = bitBuf & ((1 << n) - 1);
      bitBuf >>>= n; bitCnt -= n;
      return v;
    };
    const decode = t => {
      let code = 0, first = 0, index = 0;
      for (let len = 1; len < 16; len++) {
        code |= bits(1);
        const count = t.counts[len];
        if (code - count < first) return t.symbols[index + (code - first)];
        index += count; first += count; first <<= 1; code <<= 1;
      }
      throw new Error("Bad Huffman code");
    };

    let last = 0;
    while (!last) {
      last = bits(1);
      const type = bits(2);
      if (type === 0) {                       // stored block
        bitBuf = 0; bitCnt = 0;
        const len = src[pos] | (src[pos + 1] << 8); pos += 4;
        ensure(len); out.set(src.subarray(pos, pos + len), outLen);
        outLen += len; pos += len;
        continue;
      }
      let lit, dist;
      if (type === 1) { fixed(); lit = FIXED_LIT; dist = FIXED_DIST; }
      else if (type === 2) {                  // dynamic Huffman tables
        const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
        const cl = new Uint8Array(19);
        for (let i = 0; i < hclen; i++) cl[CL_ORDER[i]] = bits(3);
        const clTable = build(cl);
        const lens = new Uint8Array(hlit + hdist);
        for (let i = 0; i < hlit + hdist;) {
          const sym = decode(clTable);
          if (sym < 16) lens[i++] = sym;
          else {
            let rep, val = 0;
            if (sym === 16) { val = lens[i - 1]; rep = 3 + bits(2); }
            else if (sym === 17) rep = 3 + bits(3);
            else rep = 11 + bits(7);
            while (rep--) lens[i++] = val;
          }
        }
        lit = build(lens.subarray(0, hlit)); dist = build(lens.subarray(hlit));
      } else throw new Error("Invalid block type");

      for (;;) {
        const sym = decode(lit);
        if (sym < 256) { ensure(1); out[outLen++] = sym; }
        else if (sym === 256) break;
        else {
          const li = sym - 257;
          const len = LEN_BASE[li] + bits(LEN_EXTRA[li]);
          const di = decode(dist);
          const d = DIST_BASE[di] + bits(DIST_EXTRA[di]);
          ensure(len);
          for (let k = 0; k < len; k++, outLen++) out[outLen] = out[outLen - d];
        }
      }
    }
    return out.subarray(0, outLen);
  }

  (typeof window !== "undefined" ? window : globalThis).Inflate = { raw };
})();
