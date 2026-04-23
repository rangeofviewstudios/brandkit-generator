import type { BrandKitData, TemplateId } from "../types";

function escapeCSS(str: string): string {
  return str.replace(/</g, "\\3c ").replace(/>/g, "\\3e ");
}

function getTemplateCSS(template: TemplateId, data: BrandKitData): string {
  const displayFont = `'${data.typography.displayFont.name}', ${data.typography.displayFont.fallback}`;
  const bodyFont = `'${data.typography.bodyFont.name}', ${data.typography.bodyFont.fallback}`;

  // Build CSS variables from user colors
  const colorVars = data.colors.swatches
    .map((s) => `  ${s.cssVariable}: ${s.hex};`)
    .join("\n");

  // Primary gradient
  const primaryGrad = data.gradients.find((g) => g.isPrimary);
  const gradVar = primaryGrad ? `  --grad: ${primaryGrad.css};` : "";

  // Determine background/foreground from template + colors
  const isWarm = template === "warm-earth";
  const bgColor = data.colors.swatches[0]?.hex || (isWarm ? "#3B2114" : "#03256C");
  const fgColor =
    data.colors.swatches[data.colors.swatches.length - 1]?.hex ||
    (isWarm ? "#FFF4E3" : "#F8F8F8");
  const accentColor = data.colors.swatches.length > 2
    ? data.colors.swatches[Math.floor(data.colors.swatches.length / 2)]?.hex
    : (isWarm ? "#90422C" : "#1768AC");

  const grainOverlay = isWarm
    ? `
body::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}`
    : "";

  const coverOverlay = isWarm
    ? `
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 70% at 75% 55%, ${accentColor}38 0%, transparent 65%),
    radial-gradient(ellipse 30% 40% at 20% 80%, ${bgColor}4d 0%, transparent 60%);
  pointer-events: none;
}`
    : `
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    90deg, transparent, transparent 79px, rgba(255,255,255,0.03) 80px
  ),
  repeating-linear-gradient(
    0deg, transparent, transparent 79px, rgba(255,255,255,0.03) 80px
  );
}`;

  const navCSS = isWarm
    ? `
.pill-nav {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(20, 10, 5, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.pill-nav.show { opacity: 1; pointer-events: auto; }
.pill-nav a {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  display: block;
  position: relative;
  transition: background 0.2s, transform 0.2s;
  cursor: pointer;
}
.pill-nav a:hover { background: rgba(255,255,255,0.55); transform: scale(1.25); }
.pill-nav a.active { background: ${accentColor}; transform: scale(1.35); }
.pill-nav a::after {
  content: attr(data-label);
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${accentColor};
  color: ${fgColor};
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s;
  font-family: var(--font-body);
}
.pill-nav a:hover::after { opacity: 1; }`
    : `
.side-nav {
  position: fixed;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s;
}
.side-nav.visible { opacity: 1; pointer-events: auto; }
.side-nav a {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: block;
  transition: background 0.2s, transform 0.2s;
  cursor: pointer;
}
.side-nav a:hover { background: rgba(255,255,255,0.6); transform: scale(1.3); }
.side-nav a.active { background: ${accentColor}; transform: scale(1.4); }`;

  return `
:root {
  --font-display: ${escapeCSS(displayFont)};
  --font-body: ${escapeCSS(bodyFont)};
  --bg: ${bgColor};
  --fg: ${fgColor};
  --accent: ${accentColor};
${colorVars}
${gradVar}
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--fg);
  min-height: 100vh;
  overflow-x: hidden;
}

${grainOverlay}

/* ── COVER ── */
.cover {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  overflow: hidden;
  background: var(--bg);
}
${coverOverlay}
.cover-left {
  padding: 80px 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  ${isWarm ? "" : "border-right: 1px solid rgba(255,255,255,0.08);"}
}
.cover-eyebrow {
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--accent);
  font-weight: 500;
}
.cover-logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 0;
}
.cover-logo-wrap img {
  width: 60%;
  max-width: 260px;
}
.cover-title {
  font-family: var(--font-display);
  font-size: clamp(40px, 4.5vw, 64px);
  font-weight: ${isWarm ? "400" : "300"};
  line-height: 1.08;
  color: var(--fg);
  ${!isWarm ? "letter-spacing: -0.02em;" : ""}
}
.cover-title strong {
  font-weight: ${isWarm ? "700" : "500"};
  ${!isWarm ? "display: block;" : ""}
}
.cover-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.cover-meta span {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.1em;
  font-weight: 300;
}
.cover-right {
  padding: 80px 64px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  z-index: 1;
}
.cover-toc { list-style: none; }
.cover-toc li a {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  font-size: 11px;
  letter-spacing: 0.12em;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  text-decoration: none;
  transition: color 0.2s, padding-left 0.25s;
}
.cover-toc li a:hover { color: var(--fg); padding-left: 10px; }
.cover-toc li a .num { font-size: 10px; color: var(--accent); min-width: 22px; }

/* ── FLOATING ACTIONS ── */
.float-actions {
  position: fixed;
  top: 24px; right: 24px;
  z-index: 9000;
  display: flex;
  gap: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s;
}
.float-actions.show { opacity: 1; pointer-events: auto; }
.float-btn {
  padding: 9px 18px;
  background: rgba(20,10,5,0.82);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.float-btn:hover { background: var(--accent); border-color: var(--accent); transform: translateY(-1px); }

${navCSS}

/* ── SECTIONS ── */
.section {
  padding: 100px 80px;
  position: relative;
}
.section-label {
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 52px;
  display: flex;
  align-items: center;
  gap: 18px;
  font-weight: 500;
}
.section-label::after {
  content: '';
  flex: 1; height: 1px;
  background: currentColor;
  opacity: 0.2;
}
.section-heading {
  font-family: var(--font-display);
  font-size: clamp(32px, 3.5vw, 52px);
  font-weight: ${isWarm ? "400" : "300"};
  line-height: 1.1;
  margin-bottom: 60px;
}
.section-heading strong { font-weight: 700; }

.bg-dark { background: var(--bg); color: var(--fg); }
.bg-light { background: ${isWarm ? fgColor : "#f4f6fa"}; color: ${bgColor}; }
.bg-darker { background: ${isWarm ? "#1a0d07" : "#0a1628"}; color: var(--fg); }

/* ── LOGO SECTION ── */
.logo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.logo-cell {
  padding: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  position: relative;
  min-height: 260px;
  transition: background 0.4s ease;
}
.logo-cell img {
  width: 55%;
  max-width: 200px;
  object-fit: contain;
  transition: transform 0.3s;
}
.logo-cell:hover img { transform: scale(1.04); }
.logo-cell-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.35;
}
.logo-bg-switcher {
  display: flex;
  gap: 8px;
  position: absolute;
  top: 16px; right: 16px;
  opacity: 0;
  transition: opacity 0.2s;
}
.logo-cell:hover .logo-bg-switcher { opacity: 1; }
.logo-bg-switcher button {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  padding: 0;
}
.logo-bg-switcher button:hover { border-color: var(--accent); transform: scale(1.2); }

/* Logo download button */
.logo-actions {
  position: absolute;
  bottom: 14px;
  right: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}
.logo-cell:hover .logo-actions { opacity: 1; }
.logo-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  color: inherit;
  padding: 7px 12px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 999px;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.logo-download-btn:hover {
  background: rgba(0,0,0,0.55);
  border-color: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

/* ── TYPOGRAPHY SECTION ── */
.type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.type-cell {
  padding: 48px;
  position: relative;
}
.type-label {
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.4;
  margin-bottom: 16px;
}
.type-meta {
  font-size: 10px;
  opacity: 0.3;
  margin-top: 12px;
  font-family: var(--font-body);
}
.type-display {
  font-family: var(--font-display);
}
.type-body-display {
  font-family: var(--font-body);
}

/* Font info block (at top of typography section) */
.font-info-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 48px;
  padding: 24px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
}
.bg-light .font-info-block {
  background: rgba(0,0,0,0.03);
  border-color: rgba(0,0,0,0.08);
}
.font-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.font-info-left {
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
  min-width: 0;
}
.font-info-role {
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.45;
  font-family: var(--font-body);
  min-width: 56px;
}
.font-info-name {
  font-size: 22px;
  font-weight: 500;
}
.font-info-meta {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.4;
  font-family: var(--font-body);
}
.font-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  padding: 7px 14px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 999px;
  opacity: 0.5;
  transition: opacity 0.2s, background 0.2s, transform 0.15s;
  flex-shrink: 0;
}
.font-download-btn:hover {
  opacity: 1;
  background: rgba(255,255,255,0.08);
  transform: translateY(-1px);
}
.bg-light .font-download-btn:hover { background: rgba(0,0,0,0.06); }

/* Type cell: header with reset button + contenteditable sample */
.type-cell-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}
.type-cell-header .type-label { margin-bottom: 0; }
.type-reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: inherit;
  padding: 5px 10px;
  font-family: var(--font-body);
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}
.bg-light .type-reset-btn { border-color: rgba(0,0,0,0.12); }
.type-cell:hover .type-reset-btn { opacity: 0.6; }
.type-reset-btn:hover {
  opacity: 1 !important;
  background: rgba(255,255,255,0.06);
}
.bg-light .type-reset-btn:hover { background: rgba(0,0,0,0.04); }

.type-sample-wrap {
  position: relative;
}
[contenteditable="true"].type-display,
[contenteditable="true"].type-body-display {
  outline: none;
  cursor: text;
  border-radius: 6px;
  margin: -8px -10px;
  padding: 8px 10px;
  transition: background 0.2s, box-shadow 0.2s;
}
[contenteditable="true"]:hover {
  background: rgba(255,255,255,0.03);
}
.bg-light [contenteditable="true"]:hover { background: rgba(0,0,0,0.025); }
[contenteditable="true"]:focus {
  background: rgba(255,255,255,0.05);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.12);
}
.bg-light [contenteditable="true"]:focus {
  background: rgba(0,0,0,0.04);
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12);
}

/* ── COLOR PALETTE ── */
.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 3px;
}
.color-swatch {
  padding: 40px 28px 28px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: opacity 0.2s;
  position: relative;
}
.color-swatch:hover { opacity: 0.92; }
.swatch-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}
.swatch-role {
  font-size: 10px;
  opacity: 0.5;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.swatch-hex {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  opacity: 0.7;
  cursor: pointer;
}
.swatch-unit {
  margin-top: 10px;
  display: flex;
  gap: 4px;
}
.swatch-unit button {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: inherit;
  padding: 3px 7px;
  font-family: 'Courier New', monospace;
  font-size: 9px;
  cursor: pointer;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.swatch-unit button.active {
  background: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.4);
}

/* Swatch footer: unit toggle + CSS copy button */
.swatch-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}
.swatch-footer .swatch-unit { margin-top: 0; }
.swatch-copy-css {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  color: inherit;
  padding: 3px 8px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 3px;
  font-weight: 500;
  transition: background 0.2s, border-color 0.2s;
}
.swatch-copy-css:hover {
  background: rgba(255,255,255,0.22);
  border-color: rgba(255,255,255,0.4);
}

/* ── GRADIENTS ── */
.gradient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.gradient-card {
  height: 200px;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  position: relative;
  overflow: hidden;
}
.gradient-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
.gradient-copy-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  padding: 7px 12px;
  font-family: var(--font-body);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 999px;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s, transform 0.15s;
}
.gradient-card:hover .gradient-copy-btn { opacity: 1; }
.gradient-copy-btn:hover {
  background: rgba(0,0,0,0.6);
  border-color: rgba(255,255,255,0.35);
  transform: translateY(-1px);
}
.gradient-name {
  font-size: 13px;
  font-weight: 500;
  margin-top: 14px;
}
.gradient-css {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  opacity: 0.55;
  margin-top: 4px;
  cursor: pointer;
  word-break: break-all;
  transition: opacity 0.2s;
}
.gradient-css:hover { opacity: 0.9; }

/* ── BRAND VOICE ── */
.voice-pillars {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 60px;
}
.voice-pillar {
  padding: 32px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
}
.voice-pillar-num {
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.3;
  margin-bottom: 16px;
}
.voice-pillar-word {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: ${isWarm ? "400" : "500"};
  margin-bottom: 12px;
}
.voice-pillar-desc {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.6;
}
.voice-examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
.voice-col h3 {
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 20px;
  opacity: 0.5;
}
.voice-col ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.voice-col li {
  font-size: 14px;
  line-height: 1.5;
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
}

/* ── FOOTER ── */
.footer {
  padding: 40px 80px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 11px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.08em;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.footer a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

/* ── TOAST ── */
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(0,0,0,0.85);
  color: #fff;
  padding: 10px 24px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.06em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s, transform 0.25s;
  z-index: 10000;
  backdrop-filter: blur(12px);
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ── REVEAL ANIMATION ── */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .cover { grid-template-columns: 1fr; }
  .cover-right { display: none; }
  .cover-left { padding: 60px 32px; }
  .section { padding: 60px 32px; }
  .logo-grid { grid-template-columns: 1fr; }
  .type-grid { grid-template-columns: 1fr; }
  .voice-examples { grid-template-columns: 1fr; }
  .footer { flex-direction: column; gap: 12px; padding: 32px; }
  .font-info-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .font-info-left { width: 100%; }
  .font-download-btn { align-self: stretch; justify-content: center; }
  .swatch-footer { flex-wrap: wrap; gap: 6px; }
}

/* ── PRINT ── */
@media print {
  body::after { display: none; }
  .pill-nav, .side-nav, .float-actions, .toast { display: none !important; }
  .section { break-inside: avoid; padding: 40px; }
  .cover { min-height: auto; break-after: page; }
}
`;
}

export function generateCSS(data: BrandKitData): string {
  return getTemplateCSS(data.template, data);
}
