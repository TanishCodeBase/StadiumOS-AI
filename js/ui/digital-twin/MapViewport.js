import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { CoordinateSystem } from './CoordinateSystem.js';
import { ViewportController } from './ViewportController.js';
import { layerManager } from './LayerManager.js';
import { StadiumGeometry } from './StadiumGeometry.js';

// Scene & Spatial Managers
import { sceneGraph } from './scene/SceneGraph.js';
import { SelectionManager } from './spatial/SelectionManager.js';
import { VisibilityManager } from './spatial/VisibilityManager.js';
import { ViewFrustum } from './spatial/ViewFrustum.js';
import { HitTest } from './spatial/HitTest.js';

// Layers
import { CrowdLayer } from './CrowdLayer.js';
import { HeatmapLayer } from './HeatmapLayer.js';
import { TransitLayer } from './TransitLayer.js';
import { PersonnelLayer } from './PersonnelLayer.js';
import { RouteLayer } from './RouteLayer.js';
import { GateLayer } from './GateLayer.js';
import { IncidentLayer } from './IncidentLayer.js';
import { OverlayLayer } from './OverlayLayer.js';

export class MapViewport extends Component {
  constructor(props) {
    super(props);
    this.coords = new CoordinateSystem(600, 500);
    this.layerManager = layerManager;
    this.selectionManager = new SelectionManager();
    this.visibilityManager = new VisibilityManager(this.layerManager);
    this.controller = null;
  }

  onMount() {
    const svgEl = document.getElementById('digital-twin-svg');
    if (svgEl) {
      this.controller = new ViewportController(this.coords, () => this.update());
      this.controller.bindEvents(svgEl);

      const rect = svgEl.getBoundingClientRect();
      this.coords.fitToViewport(rect.width || 600, rect.height || 500);
      this.update();
    }

    const unsubscribeLayers = this.layerManager.subscribe(() => this.update());
    this.addSubscription(unsubscribeLayers);
  }

  handleSelectNode(node) {
    if (!node) return;
    this.selectionManager.select(node.id);
    this.update();
  }

  render() {
    const { mapViewModel, spatialIndex } = this.props;
    const { pitch, innerRing, outerRing } = StadiumGeometry;

    // Build View Frustum and filter visible nodes
    const frustum = new ViewFrustum(this.coords);
    const allNodes = sceneGraph.getNodes();
    const visibleNodes = this.visibilityManager.filter(allNodes, frustum);

    // Partition visible nodes by type
    const crowdNodes = visibleNodes.filter(n => n.type === 'CROWD');
    const responderNodes = visibleNodes.filter(n => n.type === 'RESPONDER');
    const routeNodes = visibleNodes.filter(n => n.type === 'ROUTE');
    const gateNodes = visibleNodes.filter(n => n.type === 'GATE');
    const incidentNodes = visibleNodes.filter(n => n.type === 'INCIDENT');

    // Get active selection details
    const selectedIds = this.selectionManager.getSelection();
    const selectedId = selectedIds[0] || null;
    const selectedNode = selectedId ? sceneGraph.getNode(selectedId) : null;

    const selectedItemDetails = selectedNode ? {
      id: selectedNode.id,
      info: selectedNode.type === 'CROWD'
        ? `Density occupancy: ${selectedNode.metadata.occupancy}%`
        : selectedNode.type === 'RESPONDER'
          ? `Status: ${selectedNode.metadata.status} | Type: ${selectedNode.metadata.type}`
          : selectedNode.type === 'GATE'
            ? `Gate code reference: ${selectedNode.metadata.code}`
            : selectedNode.type === 'INCIDENT'
              ? `Type: ${selectedNode.metadata.type} | Severity: ${selectedNode.metadata.severity} | Status: ${selectedNode.metadata.status} (${selectedNode.metadata.location})`
              : `Inspecting AI Recommendation ID`
    } : null;

    // Convert core base geometries using CoordinateSystem scale factors
    const centerPt = this.coords.worldToScreen(pitch.cx, pitch.cy);
    const pRx = pitch.rx * this.coords.scale;
    const pRy = pitch.ry * this.coords.scale;
    const oRx = outerRing.rx * this.coords.scale;
    const oRy = outerRing.ry * this.coords.scale;
    const iRx = innerRing.rx * this.coords.scale;
    const iRy = innerRing.ry * this.coords.scale;

    return h('div', {
      className: 'viewport-container',
      style: 'position: relative; width: 100%; height: 100%; min-height: 400px; background: #0b0f19; overflow: hidden; user-select: none;'
    }, [
      // Viewport buttons
      h('div', {
        className: 'viewport-controls',
        style: 'position: absolute; bottom: 15px; right: 15px; display: flex; gap: 8px; z-index: 10;'
      }, [
        h('button', {
          className: 'btn-noc',
          onClick: () => {
            const svgEl = document.getElementById('digital-twin-svg');
            if (svgEl) {
              const rect = svgEl.getBoundingClientRect();
              this.coords.fitToViewport(rect.width || 600, rect.height || 500);
              this.update();
            }
          }
        }, 'Fit View'),
        h('button', {
          className: 'btn-noc',
          onClick: () => {
            this.selectionManager.clear();
            this.update();
          }
        }, 'Clear Selection')
      ]),

      // Layer checkboxes menu
      h('div', {
        className: 'layer-toggles-bar',
        style: 'position: absolute; top: 15px; right: 15px; display: flex; flex-direction: column; gap: 6px; background: rgba(17, 24, 39, 0.85); padding: 10px; border-radius: 6px; border: 1px solid #1f2937; z-index: 10;'
      }, [
        h('div', { style: 'font-size: 10px; font-weight: bold; color: #9ca3af; margin-bottom: 4px;' }, 'LAYER TOGGLES'),
        Object.keys(this.layerManager.layers).map(layerId => {
          if (layerId === 'selection') return null;
          return h('label', {
            style: 'display: flex; align-items: center; gap: 6px; font-size: 11px; color: #ffffff; cursor: pointer;'
          }, [
            h('input', {
              type: 'checkbox',
              checked: this.layerManager.isVisible(layerId),
              style: 'cursor: pointer;',
              onChange: () => this.layerManager.toggle(layerId)
            }),
            layerId.toUpperCase()
          ]);
        })
      ]),

      // SVG map
      h('svg', {
        id: 'digital-twin-svg',
        width: '100%',
        height: '100%',
        style: 'display: block; width: 100%; height: 100%; cursor: grab;',
        'aria-label': 'Stadium Digital Twin Map Viewport',
        tabindex: '0',
        onClick: (e) => {
          // Implement Hit Testing to resolve clicks to SceneNodes
          const rect = e.currentTarget.getBoundingClientRect();
          const screenX = e.clientX - rect.left;
          const screenY = e.clientY - rect.top;

          const worldPt = this.coords.screenToWorld(screenX, screenY);
          const hitTester = new HitTest(spatialIndex);
          const hitNode = hitTester.findAtPoint(worldPt);

          if (hitNode) {
            this.handleSelectNode(hitNode);
          }
        }
      }, [
        // 1. Stadium Outer Outline Structure
        this.layerManager.isVisible('base') ? h('g', { className: 'stadium-outer-structures' }, [
          h('ellipse', {
            cx: centerPt.x,
            cy: centerPt.y,
            rx: oRx,
            ry: oRy,
            fill: 'none',
            stroke: '#4b5563',
            strokeWidth: '2.5'
          })
        ]) : null,

        // 2. Seating Sectors (Crowd Density Layer)
        this.layerManager.isVisible('crowd') ? h(CrowdLayer, {
          nodes: crowdNodes,
          coords: this.coords,
          selectedZoneId: selectedId
        }) : null,

        // 3. Playing Field (Pitch, Centerline, Inner Ring)
        this.layerManager.isVisible('base') ? h('g', { className: 'stadium-playing-field' }, [
          h('ellipse', {
            cx: centerPt.x,
            cy: centerPt.y,
            rx: pRx,
            ry: pRy,
            fill: '#065f46',
            fillOpacity: '0.25',
            stroke: '#10b981',
            strokeWidth: '1.5'
          }),
          h('line', {
            x1: centerPt.x,
            y1: centerPt.y - pRy,
            x2: centerPt.x,
            y2: centerPt.y + pRy,
            stroke: '#10b981',
            strokeWidth: '1',
            strokeOpacity: '0.5'
          }),
          h('ellipse', {
            cx: centerPt.x,
            cy: centerPt.y,
            rx: iRx,
            ry: iRy,
            fill: 'none',
            stroke: '#374151',
            strokeWidth: '1.5',
            strokeDasharray: '4,4'
          })
        ]) : null,

        // 4. Infrastructure Gates (consuming SceneNodes)
        this.layerManager.isVisible('base') ? h(GateLayer, {
          nodes: gateNodes,
          coords: this.coords,
          selectedGateId: selectedId,
          showCameras: this.layerManager.isVisible('cameras')
        }) : null,

        // 5. Heatmap Overlay Layer
        this.layerManager.isVisible('heatmap') && mapViewModel ? h(HeatmapLayer, {
          viewModel: mapViewModel.heatmap,
          coords: this.coords
        }) : null,

        // 6. Transit Corridors Layer
        this.layerManager.isVisible('transit') && mapViewModel ? h(TransitLayer, {
          viewModel: mapViewModel.transit,
          coords: this.coords
        }) : null,

        // 7. Active AI Routing Layer (consuming SceneNodes)
        this.layerManager.isVisible('routes') && mapViewModel ? h(RouteLayer, {
          nodes: routeNodes,
          routing: mapViewModel.routes?.routing,
          coords: this.coords
        }) : null,

        // 8. Responder Personnel Layer (consuming SceneNodes)
        this.layerManager.isVisible('personnel') && mapViewModel ? h(PersonnelLayer, {
          nodes: responderNodes,
          coords: this.coords,
          selectedPersonnelId: selectedId
        }) : null,

        // 9. Incident Markers Layer (consuming SceneNodes)
        this.layerManager.isVisible('incidents') && mapViewModel ? h(IncidentLayer, {
          nodes: incidentNodes,
          coords: this.coords
        }) : null,

        // 10. Tooltip details box
        selectedItemDetails ? h(OverlayLayer, {
          selectedItem: selectedItemDetails
        }) : null
      ])
    ]);
  }
}
export default MapViewport;
