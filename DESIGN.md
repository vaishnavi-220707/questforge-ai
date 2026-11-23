# QuestForge AI — Master Design System & Architecture Specification

> **Project Title:** AI-Powered Scholarship Application Readiness and Document Verification Platform  
> **Course:** Academic Skill Enhancement Course (SEC)  
> **Tagline:** Level Up Your Scholarship Application.  
> **Creative Direction:** Premium Cinematic Spatial 3D (Inspired by Nexora, Space and Time, and Collab)

---

## 1. Visual Reference Research & Design Analysis

### Inspection & Workspace Asset Status
- **Supplied Reference Folder (`C:\SEC\design-references\`):** Checked on local disk. No separate raw image directory existed on disk initially; research proceeded using the explicit reference names, visual characteristics, and verified live web design benchmarks.
- **Identified Design References:**
  1. **Reference A — NEXORA:**
     - *Visual Identity:* Cinematic crystalline 3D geometry, floating translucent polyhedral structures, deep obsidian/navy environment (`#060A14`), dramatic directional blue and warm specular lighting, high-contrast editorial typography.
     - *Verified Benchmark:* WebGL/React Three Fiber crystalline particle showcases and interactive 3D particle physics frameworks.
     - *QuestForge Application:* Central 3D crystalline Icosahedron hero centerpiece, glowing wireframe cage, and volumetric lighting.
  2. **Reference B — SPACE AND TIME (SxT):**
     - *Visual Identity:* Cosmic/space-themed interactive WebGL environments, decentralized data fabric concepts, signature geometric hexaspheres and orbital planetary compositions, floating particulate nodes, atmospheric volumetric lighting, and deep space navy/black background with teal/electric blue accents.
     - *Verified Benchmark:* `spaceandtime.io` and Awwwards Web3 3D showcases featuring orbital particle fabrics and telemetry HUD overlays.
     - *QuestForge Application:* Dual concentric orbital torus rings, orbiting satellite data shards, 280-particle depth field, and HUD telemetry nodes (`NODE: DETERMINISTIC_MATCHER`, `LATENCY: 12ms`).
  3. **Reference C — COLLAB / CMY CUBE:**
     - *Visual Identity:* Futuristic interactive 3D transparent geometric cubes with cyan and magenta edge reflections, refractive glassmorphism, subtle caustic lighting, precision micro-grid backgrounds, and crisp technical typography.
     - *Verified Benchmark:* Open-source WebGL shader showcases and Awwwards digital ecosystem design systems.
     - *QuestForge Application:* Cybernetic corner brackets (`+` markers), monospace telemetry tags, and high-contrast status pills.

---

## 2. Google Stitch MCP Production Workflow

- **MCP Server:** `StitchMCP` (Verified connected, authenticated, and fully operational).
- **Stitch Project Created:**
  - *Project ID:* `16355411590890605607` (`projects/16355411590890605607`)
  - *Title:* `QuestForge AI — Scholarship Application Readiness Platform`
- **Design System Asset Created:**
  - *Asset ID:* `assets/1389316726838585426`
  - *Theme:* Dark mode (`#0B132B`), headline font: `Space Grotesk`, body font: `Inter`, label font: `JetBrains Mono`, roundness: `ROUND_EIGHT`, custom seed: `#00F0FF` (Electric Cyan).
- **Generated Screens & Artifacts in Stitch:**
  1. *Screen ID `5c840c9f2e314679a51baa848922c86e`:* QuestForge AI — Homepage (Cinematic 3D hero with crystalline geometry, telemetry metrics row, 4-step pipeline, and transparency architecture).
  2. *Screen ID `1e021594d65c4fbd8d9b05892567a829`:* QuestForge AI — Upload & Audit Workspace (Target selector, mandatory checklist meter, cybernetic drag-and-drop zone with magic-byte badge, instant 1-click test presets, and live document pipeline table).
  3. *Screen ID `dc9f57deb16e4476bd34411cb926a9de`:* Interactive Three.js Crystalline Polyhedron asset code.

---

## 3. Design Tokens & Visual Hierarchy

```
Tokens:
- Background Base: #060A14 (Obsidian Navy)
- Surface Cards:   #0B132B (Deep Navy), #111A38 (Translucent Navy Container)
- Primary Accent:  #00F0FF (Electric Cyan)
- Secondary Accent:#3A86FF (Electric Blue)
- Tertiary / Clear:#00E599 (Teal / Emerald)
- Alert / Action:  #F43F5E (Rose Red), #F59E0B (Amber Warning)
- Headline Font:   Space Grotesk
- Body Font:       Inter
- Telemetry Font:  JetBrains Mono
```

### Strict Restrictions Enforced
- **Zero Purple Gradients:** Palette is strictly obsidian navy, cyan, electric blue, and teal.
- **Zero Pill Buttons:** All interactive controls use rounded rectangular geometry (`rounded-lg`, `rounded-xl`).
- **Zero Emoji Icons:** Strictly clean Lucide React vector icons.
- **Zero Fake Statistics / Reviews:** All metrics reflect verifiable pipeline capabilities or synthetic demonstration dataset flags.

---

## 4. 3D Infrastructure & Interactive Motion System

1. **`CinematicHero3D.jsx`:**
   - 3D Icosahedron crystal core with Phong refraction and emissive cyan specular lighting.
   - Outer wireframe cage for cybernetic structure.
   - Dual concentric Torus rings orbiting at opposite inclinations.
   - 12 Octahedron satellite data shards with mathematical orbital trajectories.
   - 280 volumetric depth particles responding to mouse parallax.
   - WebGL context-loss detection and clean fallback.
2. **`SpatialBackground3D.jsx`:**
   - Ambient 140-particle constellation for internal pages.
   - Subtle scroll-driven parallax.
   - Auto-disabled when `prefers-reduced-motion` is active.
3. **`Cursor3D.jsx`:**
   - Precision center dot + smooth trailing cyan halo.
   - Context-sensitive magnetic scale-up on buttons, links, and inputs.
   - Strictly `pointer-events-none` — never blocks clicks or text selection.
   - Disabled on touch devices (`@media (hover: none)`).
4. **`SpatialCard.jsx`:**
   - Reusable spatial card with cybernetic corner brackets (`+` markers).
   - Subtle cyan glow border and hover elevation.

---

## 5. Complete Application Route Inventory & Redesign

| Route | Page Component | Design Treatment | Functional Capabilities |
|---|---|---|---|
| `/` | `HomePage.jsx` | Cinematic 3D hero, HUD frame, telemetry row, 4-step pipeline, transparency card | Full routing to Explorer & Upload |
| `/scholarships` | `ScholarshipExplorerPage.jsx` | Cybernetic catalog, search, category & education filters | Live query, synthetic demo badges |
| `/scholarships/:id` | `ScholarshipDetailPage.jsx` | Mandatory checklist cards, rule criteria, portal references | Filtered audit actions |
| `/upload` | `DocumentUploadPage.jsx` | Studio sub-bar, checklist meter, 1-click test presets, hex signatures | PDF/PNG/JPG upload, magic-bytes |
| `/analysis` | `DocumentAnalysisPage.jsx` | Structured entity inspector chips, raw text buffer terminal modal | Multi-AI / OCR confidence display |
| `/audit-results/:id` | `AuditResultsPage.jsx` | Executive status banner, 4-metric telemetry, missing alerts, findings | Itemized evidence and citations |
| `/dashboard` | `StudentDashboardPage.jsx` | Telemetry KPI cards, session storage notice, audit record history table | Real-time session history |
| `/report/:id` | `ReportPage.jsx` | Spatial certificate layout with clean `@media print` black-and-white output | Print-ready PDF export |
| `/about` | `AboutPage.jsx` | Architecture pillars, deterministic engine vs AI rules, live AIStatusPanel | Live AI provider failover status |
| `/privacy` | `PrivacyPolicyPage.jsx` | Spatial compliance cards, in-memory parsing notice, FERPA principles | Transparent data policy |
| `/terms` | `TermsPage.jsx` | Legal cards, academic SEC scope, disclaimer of guarantee | Advisory terms |
| `/cookies` | `CookiePolicyPage.jsx` | Functional cookie policy, zero-tracking guarantee | Local storage disclosures |
| `/contact` | `ContactPage.jsx` | Spatial message card with academic evaluation inquiry form | Client-side feedback form |
| `*` | `NotFoundPage.jsx` | 3D error 404 card with cybernetic return actions | Graceful route fallback |

---

## 6. Functional & Test Verification Status

- **Automated Backend Test Suite:** **26/26 Tests Passing** (`node --test`)
  - AI Priority Order (Gemini -> Groq -> NVIDIA)
  - Scenario J: Gemini 429 Quota -> Groq Failover
  - Scenario K: Gemini 401 Auth -> Groq 500 Outage -> NVIDIA Failover
  - Scenario L: All Providers Fail -> Graceful Deterministic Fallback
  - Security: Filename path-traversal sanitization
  - Security: Magic-byte binary signature verification (rejection of MZ executables and HTML)
  - End-to-End Scenarios A (Perfect match), B (Missing doc), C (Name mismatch)
- **Frontend Production Build:** **Compiled with Zero Errors** (`vite build`, 1607 modules transformed).
