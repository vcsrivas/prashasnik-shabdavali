/* Minimal .xlsx reader for the browser — no libraries needed.
 *
 * An .xlsx file is a ZIP archive of XML files. This reads the ZIP directory,
 * unzips the needed parts with the browser's built-in DecompressionStream,
 * and turns one worksheet into rows of cell text.
 *
 *   const rows = await XlsxReader.readSheet(arrayBuffer, "Glossary");
 *   // rows = [["S.No.", "Hindi Term", ...], [1, "कार्यालय", "Office", ...], ...]
 */
(function () {
  "use strict";

  const dec = new TextDecoder("utf-8");

  // ---- ZIP ----
  function listZip(buf) {
    const v = new DataView(buf);
    // End-of-central-directory record: search backwards for its signature.
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
      if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Not a valid .xlsx (ZIP) file");
    const count = v.getUint16(eocd + 10, true);
    let p = v.getUint32(eocd + 16, true);
    const entries = {};
    for (let n = 0; n < count; n++) {
      if (v.getUint32(p, true) !== 0x02014b50) throw new Error("Corrupt ZIP directory");
      const method = v.getUint16(p + 10, true);
      const csize = v.getUint32(p + 20, true);
      const nameLen = v.getUint16(p + 28, true);
      const extraLen = v.getUint16(p + 30, true);
      const commentLen = v.getUint16(p + 32, true);
      const local = v.getUint32(p + 42, true);
      const name = dec.decode(new Uint8Array(buf, p + 46, nameLen));
      entries[name] = { method, csize, local };
      p += 46 + nameLen + extraLen + commentLen;
    }
    return entries;
  }

  async function readEntry(buf, entries, name) {
    const e = entries[name];
    if (!e) return null;
    const v = new DataView(buf);
    const start = e.local + 30 + v.getUint16(e.local + 26, true) + v.getUint16(e.local + 28, true);
    const data = new Uint8Array(buf, start, e.csize);
    if (e.method === 0) return dec.decode(data);
    if (e.method !== 8) throw new Error("Unsupported compression in " + name);
    try {
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return await new Response(stream).text();
    } catch (err) {
      // Older browsers/WebViews lack DecompressionStream("deflate-raw"): use inflate.js
      if (!window.Inflate) throw err;
      return dec.decode(window.Inflate.raw(data));
    }
  }

  // ---- XML helpers ----
  const parse = s => new DOMParser().parseFromString(s, "application/xml");
  const byTag = (node, tag) => Array.from(node.getElementsByTagNameNS("*", tag));
  // Text of a shared string or inline string: plain <t>, or rich-text runs <r><t>.
  const textOf = node => byTag(node, "t").map(t => t.textContent).join("");

  function colIndex(ref) {           // "C12" -> 2
    let n = 0;
    for (const ch of ref.replace(/\d+$/, "")) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  }

  // Map sheet names to their XML paths, in workbook order.
  async function sheetPaths(buf, entries) {
    const wb = parse(await readEntry(buf, entries, "xl/workbook.xml"));
    const relsXml = await readEntry(buf, entries, "xl/_rels/workbook.xml.rels");
    const rels = {};
    if (relsXml) {
      for (const r of byTag(parse(relsXml), "Relationship")) {
        let t = r.getAttribute("Target");
        t = t.startsWith("/") ? t.slice(1) : "xl/" + t.replace(/^\.\//, "");
        rels[r.getAttribute("Id")] = t;
      }
    }
    return byTag(wb, "sheet").map((s, i) => ({
      name: s.getAttribute("name"),
      path: rels[s.getAttribute("r:id") || s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id")]
            || "xl/worksheets/sheet" + (i + 1) + ".xml",
    }));
  }

  async function readSheet(buf, preferredName) {
    const entries = listZip(buf);
    const sheets = await sheetPaths(buf, entries);
    if (!sheets.length) throw new Error("The workbook has no sheets");
    const want = (preferredName || "").toLowerCase();
    const sheet = sheets.find(s => s.name.toLowerCase() === want) || sheets[0];

    const sstXml = await readEntry(buf, entries, "xl/sharedStrings.xml");
    const shared = sstXml ? byTag(parse(sstXml), "si").map(textOf) : [];

    const xml = await readEntry(buf, entries, sheet.path);
    if (!xml) throw new Error("Sheet '" + sheet.name + "' could not be read");
    const rows = [];
    for (const row of byTag(parse(xml), "row")) {
      const out = [];
      byTag(row, "c").forEach((c, k) => {
        const ref = c.getAttribute("r");
        const col = ref ? colIndex(ref) : k;
        const type = c.getAttribute("t");
        const vNode = byTag(c, "v")[0];
        let val;
        if (type === "s") val = shared[+vNode?.textContent] ?? "";
        else if (type === "inlineStr") val = textOf(c);
        else val = vNode ? vNode.textContent : "";
        out[col] = val;
      });
      rows.push(Array.from(out, x => (x == null ? "" : String(x))));
    }
    return { sheet: sheet.name, rows };
  }

  window.XlsxReader = { readSheet };
})();
