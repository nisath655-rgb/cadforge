# CADForge — 3-Project Full-Feature Starter

A browser CAD MVP optimized for phone + PC.

## Free plan rule
The first **3 projects are full-feature projects**. There is no per-feature lock inside those projects. The free limit is the number of active projects.

## Included in this package
- 2D canvas CAD editor
- LINE / POLYLINE / CIRCLE / ARC / RECTANGLE
- MOVE / COPY / ROTATE / OFFSET / TRIM workflow / DIST / HATCH / ERASE
- Coordinate input, relative/polar input, snap, ortho, grid
- Zoom / pan / undo / redo
- Layers
- Local project save/load
- 3-project free quota
- DXF / SVG / PNG export
- Project manager
- Pricing/subscription UI
- PayHere checkout bridge (server-side; credentials required)
- Image underlay for manual CAD tracing
- Responsive phone + PC UI

## Important limits
This starter does **not** pretend that a static JavaScript canvas is a native DWG engine or automatic AI image-to-CAD converter. Real DWG read/write and automatic image-to-vector CAD conversion require dedicated geometry/format services and are marked as future integration points.

## Payment setup
PayHere requires a Merchant ID and Merchant Secret. Keep those on the server, never in browser JavaScript. Copy `backend.env.example` to `.env`, fill credentials, and use the sandbox first. The included `server.js` creates a server-side checkout payload and verifies PayHere notification signatures before the TODO database update.

PayHere docs: https://support.payhere.lk/api-%26-mobile-sdk/recurring-api

## Run locally
Node 18+:

```bash
npm install
npm start
```

Then open http://localhost:3000

For production, replace the demo/local project storage with a real authentication + database layer, and persist verified subscription events before unlocking PRO/PREMIUM.
