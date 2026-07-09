import { CrowdNode } from './CrowdNode.js';
import { ResponderNode } from './ResponderNode.js';
import { RouteNode } from './RouteNode.js';
import { GateNode } from './GateNode.js';

export const SceneFactory = {
  /**
   * Creates a CrowdNode from a CrowdZone model
   * @param {CrowdZone} zone 
   * @returns {CrowdNode}
   */
  createCrowdNode(zone) {
    const coords = this._getZoneCenter(zone.zone);
    return new CrowdNode({
      id: zone.zone,
      position: coords,
      bounds: { x: coords.x - 50, y: coords.y - 50, width: 100, height: 100 },
      metadata: { occupancy: zone.occupancy, capacity: zone.capacity, status: zone.status }
    });
  },

  /**
   * Creates a ResponderNode from a Responder model
   * @param {Responder} responder 
   * @returns {ResponderNode}
   */
  createResponderNode(responder) {
    return new ResponderNode({
      id: responder.id,
      position: { x: responder.x, y: responder.y },
      bounds: { x: responder.x - 10, y: responder.y - 10, width: 20, height: 20 },
      metadata: { type: responder.type, status: responder.status }
    });
  },

  /**
   * Creates a RouteNode from a Recommendation model
   * @param {Recommendation} rec 
   * @returns {RouteNode}
   */
  createRouteNode(rec) {
    return new RouteNode({
      id: rec.id,
      position: { x: 300, y: 250 },
      bounds: { x: 50, y: 50, width: 500, height: 400 },
      metadata: { type: rec.type, action: rec.action, status: rec.status }
    });
  },

  /**
   * Creates a GateNode from geometry definition
   * @param {object} gate 
   * @returns {GateNode}
   */
  createGateNode(gate) {
    return new GateNode({
      id: gate.id,
      position: { x: gate.x, y: gate.y },
      bounds: { x: gate.x - 12, y: gate.y - 12, width: 24, height: 24 },
      metadata: { label: gate.label, code: gate.code }
    });
  },

  _getZoneCenter(zoneName) {
    switch (zoneName) {
      case 'North Stand': return { x: 300, y: 120 };
      case 'North East Stand': return { x: 420, y: 150 };
      case 'East Stand': return { x: 450, y: 250 };
      case 'South East Stand': return { x: 420, y: 350 };
      case 'South Stand': return { x: 300, y: 380 };
      case 'South West Stand': return { x: 180, y: 350 };
      case 'West Stand': return { x: 150, y: 250 };
      case 'North West Stand': return { x: 180, y: 150 };
      default: return { x: 300, y: 250 };
    }
  }
};

export default SceneFactory;
