# StadiumOS AI

A professional, high-density AI-powered Stadium Operations Center (SOC/NOC) dashboard designed for real-time spectator crowd flow, incident coordination, and transit routing dispatches. The platform features an interactive spatial Digital Twin, contextualized decision-support reasoning, and a custom-built lightweight Virtual DOM rendering architecture.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                               STADIUMOS AI                                   │
│                        STADIUM OPERATIONS CENTER                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Markup-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-Vanilla-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![SVG](https://img.shields.io/badge/SVG-Namespace%20Vector-green.svg)](https://www.w3.org/Graphics/SVG/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## Overview

**StadiumOS AI** is an enterprise-grade command center dashboard engineered to manage large-scale stadium events. It aggregates and visualizes real-time metrics through a spatial Digital Twin, operations timeline feed, and AI recommendation dispatches, providing comprehensive situational awareness for operators.

Rather than relying on modern heavyweight frameworks like React or Vue, the entire frontend stack is built from the ground up using a custom, lightweight Virtual DOM rendering pipeline, complete with a reconciliation engine, component lifecycle methods, and reactive state management. This ensures low-overhead performance, instant DOM patching, and high-frequency rendering ticks required for live simulations.

---

## Features

### AI Decision Support
* **Context-Aware Recommendations**: Dynamic suggestions generated from active stand occupancies and incidents.
* **Decision Reasoning Chain**: Displays the underlying contributing factors, assumptions, and logical steps.
* **AI Explanation Panel**: Dedicated diagnostic view showing walking time delta impacts, queue lengths, and risk level adjustments.
* **Prediction Horizon**: Real-time forecast horizons indicating expected bottleneck latencies (e.g. Next 3 minutes).
* **Confidence Scoring**: Dynamic confidence ratings aligned with prediction variables.

### Digital Twin
* **Interactive SVG Canvas**: Visualizes stadium stand structures, perimeter gates, and pitch zones.
* **Hardware-Accelerated Pan & Zoom**: Responsive navigation with focus boundaries ranging from 0.1x to 12.0x.
* **Interactive Layer controls**: Immediate on-the-fly toggling for Crowd, Heatmap, Personnel, Transit, Routes, Cameras, and Incidents.
* **Animated Crowd Particles**: Concentric stand particles that pulse and shimmer relative to stand densities.
* **Smooth Responder Tracking**: Dispatched security/medical details slide smoothly between coordinates using CSS group translations.
* **Incident Warnings & Routes**: Pulsing alert circles and flowing directional dispatch lines indicating evacuation vectors.

### Operations Dashboard
* **Executive KPI Ribbon**: Full-width header summary showing live occupancy, active dispatches, responder allocations, and response delays.
* **Incident Monitoring Logs**: compact cards detailing active log locations and elapsed response durations.
* **Emergency Dispatch Controls**: Manual deployment triggers for medical rescue, security, and fire services.
* **Volunteer Staffing**: Sector-specific volunteer check-in rates and readiness percentages.
* **Public Transit Tracking**: Live metro capacity usage, passenger queues, and dynamic ETAs.

### Engineering & Infrastructure
* **Custom Virtual DOM**: Lightweight virtual node constructor (`h()`) and tag creation.
* **Reconciliation Engine**: Direct DOM-patching algorithm managing lifecycle mount/unmount and placeholder comment hooks.
* **Event Bus & State Store**: Centralized unidirectional state flow and publish-subscribe message broker.
* **Scene Graph & Spatial Index**: Hierarchical scene node registry with 2D grid index filtering for frustum visibility and click hit-testing.
* **Coordinate System**: Pan-zoom matrix translator converting simulation world space to screen coordinates.

---

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Digital Twin
![Digital Twin](screenshots/digital-twin.png)

### AI Decision Panel
![AI Panel](screenshots/ai-panel.png)

---

## Architecture

The system operates on an event-driven, unidirectional flow:

```
Simulation Engine (Web Worker)
      │
      ▼
Store (Reactive State Manager)
      │
      ▼
ViewModels (Crowd, Incidents, Personnel)
      │
      ▼
Custom Virtual DOM (h() VNodes)
      │
      ▼
Renderer (Reconciliation & DOM Patches)
      │
      ▼
Dashboard Components (Shell & Panels)
```

The spatial Digital Twin coordinate pipeline translates simulation positions to drawing layers:

```
Telemetry Coordinates (World Space)
      ▼
Scene Graph (SceneNode Registry)
      ▼
Spatial Index (GridIndex Bucketing)
      ▼
Coordinate System (Scale & Translation Matrix)
      ▼
SVG Renderer (Namespace-Aware Namespace Elements)
```

---

## Technology Stack

| Technology | Role |
| :--- | :--- |
| **JavaScript (ES6+)** | Core logical architecture and simulation VM |
| **HTML5** | Application frame and root DOM mounting container |
| **CSS3 (Vanilla)** | NOC command center UI layout styling and keyframe animations |
| **SVG** | Vector drawing canvas for stadium layers and routes |
| **Node.js** | Dev server environment and local package management |
| **Custom Virtual DOM** | Lightweight virtual tree representation |
| **Custom Renderer** | Lifecycle-aware DOM reconciliation and patching engine |

---

## Project Structure

```
StadiumOS-AI/
├── css/                   # Stylesheets containing design system layout and NOC themes
├── js/                    # Application codebase
│   ├── ai/                # AI engines, pipeline registry, and decision trace models
│   ├── core/              # Custom Virtual DOM, Event Bus, Store, and Layout Manager
│   ├── diagnostics/       # NOC engine performance telemetry and logger
│   ├── models/            # Core schema models (CrowdZone, Responder, Volunteer, Incident)
│   ├── simulation/        # Web worker simulation scheduler and behavior engines
│   └── ui/                # UI presentation layer
│       ├── components/    # Common widgets, charts, and Shell elements
│       ├── digital-twin/  # Digital Twin rendering layers, scene graph, and spatial indexes
│       └── panels/        # NOC dashboard panel card components
├── test/                  # Architecture validation and integration test suites
├── index.html             # Application entry point
├── package.json           # Node project configuration
└── README.md              # Documentation
```

---

## Installation

To clone and run StadiumOS AI locally, ensure you have Node.js installed.

1. Clone the repository:
   ```bash
   git clone https://github.com/placeholder/StadiumOS-AI.git
   cd StadiumOS-AI
   ```

2. Install development dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the application:
   Navigate to [http://127.0.0.1:8080](http://127.0.0.1:8080) in your web browser.

---

## Usage

* **Start Simulation**: Click the `START` button in the header toolbar to begin the live event ticks.
* **Toggle Map Layers**: Use the **Layer Visibility** panel in the footer row to toggle elements (e.g. Crowd, Heatmap, Personnel) on the map immediately.
* **Inspect Recommendations**: Click on any suggestion in the **AI Recommendations** sidebar card to view its reasoning breakdown in the **AI Decision Support** panel.
* **Monitor Incidents**: Unresolved incidents display a pulsing radar marker color-coded by severity on the stadium twin. Select them to view locator telemetry.
* **Navigate Panels**: Change layout grid presets (Default, Compact, Emergency) in the sidebar to reorganize panels.

---

## Key Technical Achievements

* **Custom Rendering Engine**: Designed a memory-efficient renderer handling high-frequency simulation ticks without frame drops.
* **Renderer Stabilization**: Eliminated null-DOM reference exceptions through DOM ownership snapshots and placeholder comment nodes.
* **SVG Namespace Support**: Built namespace-aware element instantiation using `createElementNS` to align vectors.
* **Reconciliation Engine**: Resolved reentrant component update lifecycle timing using mounted state subscriptions.
* **Enterprise NOC Layout**: Implemented a responsive command center layout prioritizing scannable KPIs over verbose text.
* **Interactive Digital Twin**: Created a spatial indexing (GridIndex) system managing coordinate conversions for panning, zooming, and click tests.

---

## Future Improvements

* **Historical Analytics**: Long-term database logging to track past dispatcher efficiencies.
* **Multi-Stadium Support**: Multi-stadium NOC operations switcher.
* **3D Digital Twin**: WebGL/Three.js overlay mapping inside the coordinate translator.
* **WebSocket Streams**: Connection interface to parse real-world telemetry feeds.
* **Authentication & RBAC**: Role-based access controls for security officers and commanders.
* **WebGPU Rendering**: Migrating SVG render groups to WebGPU canvas structures for large scale simulations.

---

## Performance

* **Fast Reconciliation**: Sub-millisecond virtual tree diffing.
* **Minimal DOM Updates**: Batched updates targeting modified elements only.
* **SVG Layering**: Decoupled static backgrounds and dynamic layers to maximize hardware acceleration.
* **Optimized Frustum Filtering**: Spatial GridIndex query checks to prune off-screen elements.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

* **Name**: [Your Name]
* **GitHub**: [github.com/yourusername](https://github.com/yourusername)
* **LinkedIn**: [linkedin.com/in/yourprofile](https://www.linkedin.com/in/yourprofile)
