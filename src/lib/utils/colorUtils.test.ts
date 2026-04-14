/**
 * Tests for colorUtils. Uses Node's built-in test runner (`node:test`) so
 * no extra dev dependencies are required.
 *
 * Run with Node 22+: `node --test --experimental-strip-types src/lib/utils/colorUtils.test.ts`
 * Or via tsx: `npx tsx --test src/lib/utils/colorUtils.test.ts`
 * If you later add Vitest, this file is compatible — rename `node:test` imports.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hexToOklch,
  oklchToHex,
  getContrastRatio,
  getRelativeLuminance,
  wcagGrade,
} from "./colorUtils";

test("hexToOklch(#EA9A61) matches chroma-js reference", () => {
  // Canonical OKLCH for #EA9A61 (cross-checked against chroma-js):
  // L=0.7548, C=0.1207, H=55.23°. Spec originally listed L≈0.72, H≈48
  // which are not correct for the specified OKLab pipeline.
  const o = hexToOklch("#EA9A61");
  assert.ok(Math.abs(o.l - 0.7548) < 0.02, `L was ${o.l}`);
  assert.ok(Math.abs(o.c - 0.1207) < 0.02, `C was ${o.c}`);
  assert.ok(Math.abs(o.h - 55.23) < 2, `H was ${o.h}`);
});

test("oklchToHex round-trips within ±2 per RGB channel", () => {
  const samples = ["#EA9A61", "#1F0F08", "#D0BEA5", "#3B2114", "#FFF4E3", "#1A2A4A"];
  for (const hex of samples) {
    const o = hexToOklch(hex);
    const { hex: rt } = oklchToHex(o);
    const a = parseInt(hex.slice(1, 3), 16);
    const b = parseInt(hex.slice(3, 5), 16);
    const c = parseInt(hex.slice(5, 7), 16);
    const a2 = parseInt(rt.slice(1, 3), 16);
    const b2 = parseInt(rt.slice(3, 5), 16);
    const c2 = parseInt(rt.slice(5, 7), 16);
    assert.ok(Math.abs(a - a2) <= 2, `${hex} -> ${rt} (r off by ${Math.abs(a - a2)})`);
    assert.ok(Math.abs(b - b2) <= 2, `${hex} -> ${rt} (g off by ${Math.abs(b - b2)})`);
    assert.ok(Math.abs(c - c2) <= 2, `${hex} -> ${rt} (b off by ${Math.abs(c - c2)})`);
  }
});

test("getContrastRatio(#000, #FFF) === 21", () => {
  assert.equal(getContrastRatio("#000000", "#FFFFFF"), 21);
});

test("getRelativeLuminance bounds", () => {
  assert.equal(getRelativeLuminance("#000000"), 0);
  assert.equal(getRelativeLuminance("#FFFFFF"), 1);
});

test("wcagGrade: 4.5 === 'AA'", () => {
  assert.equal(wcagGrade(4.5), "AA");
});

test("wcagGrade: 3.0 === 'FAIL' for normal text", () => {
  assert.equal(wcagGrade(3.0), "FAIL");
});

test("wcagGrade: 7.1 === 'AAA'", () => {
  assert.equal(wcagGrade(7.1), "AAA");
});

test("wcagGrade: 3.2 === 'AA' for large text", () => {
  assert.equal(wcagGrade(3.2, true), "AA");
});

test("oklchToHex flags gamut clipping for out-of-gamut color", () => {
  // Extreme chroma at mid L will fall outside sRGB
  const { gamutClipped } = oklchToHex({ l: 0.7, c: 0.35, h: 30 });
  assert.equal(gamutClipped, true);
});
