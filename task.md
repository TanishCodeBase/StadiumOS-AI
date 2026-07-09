# Task List: Phase 2 — Digital Twin Visualization Refinement

- [x] Update `StadiumGeometry.js` to define 4 seating stands with 6-degree gaps, central `incidentLocations`, and central `VisualSettings`.
- [x] Update `CrowdLayer.js` to scale and position the seating sectors in screen space.
- [x] Fix the responder personnel mapping bug in `MapViewModel.js` (pointing to `TelemetrySimulation` and adding `IncidentViewModel`).
- [x] Update `DigitalTwin.js` to map active incidents to the scene graph using the central coordinates.
- [x] Create `IncidentLayer.js` with pulsing radar animations and severity-aware pulse speeds.
- [x] Map `'INCIDENT'` node type to `'incidents'` in `VisibilityManager.js`.
- [x] Add `'incidents'` to the default visible layers in `LayerManager.js`.
- [x] Update `RouteLayer.js` to draw static advisory routes and animate active/emergency routing paths.
- [x] Add CSS keyframe animation for emergency routes in `css/main.css`.
- [x] Reorder layers in `MapViewport.js` to enforce back-to-front rendering order, apply configurable visual settings, and import `IncidentLayer`.
- [x] Verify maximum zoom, Fit View behavior, long-running simulation stability, and execute automated tests.
