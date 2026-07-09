import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { store } from '../../core/store.js';
import { MapViewModel } from '../viewmodels/MapViewModel.js';
import { MapViewport } from './MapViewport.js';

// Scene Graph & Spatial Registry Elements
import { sceneGraph } from './scene/SceneGraph.js';
import { SceneFactory } from './scene/SceneFactory.js';
import { SceneNode } from './scene/SceneNode.js';
import { GridIndex } from './spatial/GridIndex.js';
import { StadiumGeometry } from './StadiumGeometry.js';

export class DigitalTwin extends Component {
  constructor(props) {
    super(props);

    this.spatialIndex = new GridIndex(600, 500, 50);

    // Build an initial ViewModel from the current store state
    const initialStore = store.getState();

    const initialMapViewModel = new MapViewModel(
      initialStore.simulation?.latestFrame || null,
      initialStore.simulation?.latestDecisionFrame || null
    );

    this.state = {
      mapViewModel: initialMapViewModel
    };
  }

  onMount() {
    sceneGraph.initialize();
    this._syncState();

    const unsubscribeStore = store.subscribe(() => {
      this._syncState();
    });
    this.addSubscription(unsubscribeStore);
  }

  _syncState() {
    const storeState = store.getState();
    const latestFrame = storeState.simulation?.latestFrame || null;
    const latestDecisionFrame = storeState.simulation?.latestDecisionFrame || null;

    const mapViewModel = new MapViewModel(latestFrame, latestDecisionFrame);

    // Refresh nodes registries
    sceneGraph.clear();
    this.spatialIndex.clear();

    // 1. Map Crowd Zones
    mapViewModel.crowd.zones.forEach(zone => {
      const node = SceneFactory.createCrowdNode(zone);
      sceneGraph.addNode(node);
      this.spatialIndex.insert(node);
    });

    // 2. Map Responders
    mapViewModel.personnel.responders.forEach(resp => {
      const node = SceneFactory.createResponderNode(resp);
      sceneGraph.addNode(node);
      this.spatialIndex.insert(node);
    });

    // 3. Map Recommendation routes
    mapViewModel.routes.recommendations.forEach(rec => {
      const node = SceneFactory.createRouteNode(rec);
      sceneGraph.addNode(node);
      this.spatialIndex.insert(node);
    });

    // 4. Map Infrastructure Gates
    StadiumGeometry.gates.forEach(gate => {
      const node = SceneFactory.createGateNode(gate);
      sceneGraph.addNode(node);
      this.spatialIndex.insert(node);
    });

    // 5. Map Active Simulated Incidents
    if (mapViewModel.incidents && mapViewModel.incidents.incidents) {
      mapViewModel.incidents.incidents.forEach(inc => {
        const coords = StadiumGeometry.incidentLocations[inc.location] || { x: 300, y: 250 };
        const node = new SceneNode({
          id: inc.id,
          type: 'INCIDENT',
          position: coords,
          bounds: { x: coords.x - 12, y: coords.y - 12, width: 24, height: 24 },
          metadata: { type: inc.type, severity: inc.severity, status: inc.status, location: inc.location }
        });
        sceneGraph.addNode(node);
        this.spatialIndex.insert(node);
      });
    }

    this.setState({ mapViewModel });
  }

  render() {
    const { mapViewModel } = this.state;

    return h('div', {
      className: 'digital-twin-wrapper',
      style: 'width: 100%; height: 100%; display: flex; flex-direction: column;'
    }, [
      h(MapViewport, {
        mapViewModel,
        spatialIndex: this.spatialIndex
      })
    ]);
  }
}
export default DigitalTwin;
