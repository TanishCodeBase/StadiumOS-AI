/**
 * StadiumOS AI - Stadium Geometry & World Coordinate Registry
 */

export const StadiumGeometry = {
  worldWidth: 600,
  worldHeight: 500,

  pitch: {
    cx: 300,
    cy: 250,
    rx: 70,
    ry: 50
  },

  innerRing: {
    cx: 300,
    cy: 250,
    rx: 110,
    ry: 85
  },

  outerRing: {
    cx: 300,
    cy: 250,
    rx: 180,
    ry: 140
  },

  // 4 outer zone segments with 6-degree structural gaps at the diagonals
  zones: [
    { id: 'North Stand', startAngle: -132, endAngle: -48 },
    { id: 'East Stand', startAngle: -42, endAngle: 42 },
    { id: 'South Stand', startAngle: 48, endAngle: 132 },
    { id: 'West Stand', startAngle: 138, endAngle: 222 }
  ],

  // Real-world gate nodes with coordinate points
  gates: [
    { id: 'Gate-N', x: 300, y: 90, label: 'Gate A (North)', code: 'GATE-A' },
    { id: 'Gate-E', x: 495, y: 250, label: 'Gate B (East)', code: 'GATE-B' },
    { id: 'Gate-S', x: 300, y: 410, label: 'Gate C (South)', code: 'GATE-C' },
    { id: 'Gate-W', x: 105, y: 250, label: 'Gate D (West)', code: 'GATE-D' }
  ],

  securityCheckpoints: [
    { id: 'Sec-N', x: 300, y: 130, label: 'Sec Check A' },
    { id: 'Sec-E', x: 440, y: 250, label: 'Sec Check B' },
    { id: 'Sec-S', x: 300, y: 370, label: 'Sec Check C' },
    { id: 'Sec-W', x: 160, y: 250, label: 'Sec Check D' }
  ],

  cameras: [
    { id: 'CAM-01', x: 220, y: 170, label: 'Camera 01' },
    { id: 'CAM-02', x: 380, y: 170, label: 'Camera 02' },
    { id: 'CAM-03', x: 380, y: 330, label: 'Camera 03' },
    { id: 'CAM-04', x: 220, y: 330, label: 'Camera 04' }
  ],

  transitCorridors: [
    { id: 'Corridor-N', x1: 300, y1: 90, x2: 300, y2: 30, label: 'North Transit Corridor' },
    { id: 'Corridor-E', x1: 495, y1: 250, x2: 570, y2: 250, label: 'East Transit Corridor' },
    { id: 'Corridor-S', x1: 300, y1: 410, x2: 300, y2: 470, label: 'South Transit Corridor' },
    { id: 'Corridor-W', x1: 105, y1: 250, x2: 30, y2: 250, label: 'West Transit Corridor' }
  ],

  // Central mapping of incident locations to world coordinates (aligns with IntelligentRoutingEngine)
  incidentLocations: {
    'Gate 3': { x: 220, y: 170 },
    'Section 104': { x: 440, y: 310 },
    'Concourse B': { x: 310, y: 530 },
    'East Entrance': { x: 120, y: 410 },
    'West Parking Area': { x: 620, y: 240 }
  },

  // Central visual styling variables to avoid scattered constants in layers
  VisualSettings: {
    heatmap: {
      opacity: '0.30',
      blur: '10px'
    },
    transit: {
      opacity: '0.40',
      strokeWidth: '2.0',
      stopRadius: '4.0'
    },
    routes: {
      opacity: '0.55',
      strokeWidth: '2.5'
    },
    personnel: {
      opacity: '0.90',
      radius: '5'
    },
    incidents: {
      opacity: '0.95',
      radius: '7'
    }
  }
};

/**
 * Computes SVG arc path definition for an oval ring segment sector.
 */
export function getZoneArcPath(cx, cy, rx1, ry1, rx2, ry2, startAngleDeg, endAngleDeg) {
  const toRad = Math.PI / 180;
  const startAngle = startAngleDeg * toRad;
  const endAngle = endAngleDeg * toRad;

  // Outer ring coordinates
  const x1_outer = cx + rx2 * Math.cos(startAngle);
  const y1_outer = cy + ry2 * Math.sin(startAngle);
  const x2_outer = cx + rx2 * Math.cos(endAngle);
  const y2_outer = cy + ry2 * Math.sin(endAngle);

  // Inner ring coordinates
  const x1_inner = cx + rx1 * Math.cos(startAngle);
  const y1_inner = cy + ry1 * Math.sin(startAngle);
  const x2_inner = cx + rx1 * Math.cos(endAngle);
  const y2_inner = cy + ry1 * Math.sin(endAngle);

  const largeArcFlag = Math.abs(endAngleDeg - startAngleDeg) > 180 ? 1 : 0;

  return [
    `M ${x1_inner} ${y1_inner}`, // Go to inner ring start
    `L ${x1_outer} ${y1_outer}`, // Line to outer ring start
    `A ${rx2} ${ry2} 0 ${largeArcFlag} 1 ${x2_outer} ${y2_outer}`, // Outer arc to end
    `L ${x2_inner} ${y2_inner}`, // Line to inner ring end
    `A ${rx1} ${ry1} 0 ${largeArcFlag} 0 ${x1_inner} ${y1_inner}`, // Inner arc back to start
    'Z' // Close path
  ].join(' ');
}

export default StadiumGeometry;
