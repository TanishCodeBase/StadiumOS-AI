/**
 * StadiumOS AI - Comprehensive Integration Test Suite
 */

import { logger } from '../js/diagnostics/logger.js';
import { eventBus } from '../js/core/event-bus.js';
import { store } from '../js/core/store.js';
import { EVENTS } from '../js/core/events.js';
import { h } from '../js/core/vdom.js';

// Setup browser DOM mocks
let bodyClassList = new Set();
class MockSVGElement {}
globalThis.SVGElement = MockSVGElement;

globalThis.document = {
  body: {
    classList: {
      add(className) { bodyClassList.add(className); },
      remove(className) { bodyClassList.delete(className); },
      contains(className) { return bodyClassList.has(className); }
    }
  },
  activeElement: null,
  createElement(tag) {
    return {
      tag,
      namespaceURI: "http://www.w3.org/1999/xhtml",
      props: {},
      style: {},
      childNodes: [],
      appendChild(child) {
        this.childNodes.push(child);
        if (child) child.parentNode = this;
      },
      removeChild(child) {
        const index = this.childNodes.indexOf(child);
        if (index > -1) {
          this.childNodes.splice(index, 1);
        }
      },
      replaceChild(newChild, oldChild) {
        const index = this.childNodes.indexOf(oldChild);
        if (index > -1) {
          this.childNodes[index] = newChild;
          if (newChild) newChild.parentNode = this;
        }
      },
      setAttribute(name, value) {
        this.props[name] = value;
      },
      removeAttribute(name) {
        delete this.props[name];
      },
      addEventListener(event, callback) {
        this[`on${event}`] = callback;
      },
      removeEventListener(event, callback) {
        delete this[`on${event}`];
      },
      querySelector(sel) {
        return { focus() {} };
      },
      querySelectorAll(sel) {
        return [];
      }
    };
  },
  createElementNS(namespaceURI, tag) {
    const el = this.createElement(tag);
    el.namespaceURI = namespaceURI;
    if (namespaceURI === "http://www.w3.org/2000/svg") {
      Object.setPrototypeOf(el, SVGElement.prototype);
    }
    return el;
  },
  createTextNode(value) {
    return {
      tag: 'TEXT_ELEMENT',
      nodeValue: value,
      parentNode: null,
      nodeType: 3
    };
  },
  createComment(value) {
    return {
      tag: 'COMMENT_ELEMENT',
      nodeValue: value,
      parentNode: null,
      nodeType: 8
    };
  }
};

// Storage mocks
let storage = {};
globalThis.localStorage = {
  getItem(key) { return storage[key] || null; },
  setItem(key, value) { storage[key] = String(value); },
  removeItem(key) { delete storage[key]; }
};

// Timer mocks
let clearedTimeouts = [];
let clearedIntervals = [];
globalThis.clearTimeout = (id) => { clearedTimeouts.push(id); };
globalThis.clearInterval = (id) => { clearedIntervals.push(id); };
globalThis.requestAnimationFrame = (cb) => { return 101; };
globalThis.cancelAnimationFrame = (id) => {};
globalThis.window = {
  addEventListener() {},
  removeEventListener() {}
};

// Performance APIs mock
if (!globalThis.performance) {
  globalThis.performance = { now: () => Date.now() };
}

let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`\x1b[32m✔ PASS:\x1b[0m ${message}`);
  } else {
    console.error(`\x1b[31m✘ FAIL:\x1b[0m ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('\n=================================================');
  console.log('STADIUMOS AI - ARCHITECTURE INTEGRATION TESTS');
  console.log('=================================================\n');

  // 1. Imports
  const { BaseManager } = await import('../js/core/base-manager.js');
  const { RollingHistory } = await import('../js/utils/rolling-history.js');
  const { engineMetrics } = await import('../js/diagnostics/engine-metrics.js');
  const { shellStore } = await import('../js/ui/shell/shell-store.js');
  const { dockManager } = await import('../js/ui/shell/dock-manager.js');
  const { commandRegistry } = await import('../js/ui/shell/command-registry.js');
  const { shortcutManager } = await import('../js/ui/shell/shortcut-manager.js');
  const { focusManager } = await import('../js/ui/shell/focus-manager.js');
  const { notificationManager } = await import('../js/ui/shell/notification-manager.js');
  const { workspaceManager } = await import('../js/ui/shell/workspace-manager.js');
  const { themeManager } = await import('../js/core/theme-manager.js');
  const { layoutManager } = await import('../js/core/layout-manager.js');
  
  const { SimulationFrame } = await import('../js/simulation/frame.js');
  const { DecisionFrame } = await import('../js/ai/decision-frame.js');
  const { aiRegistry } = await import('../js/ai/registry.js');
  const { aiPipeline } = await import('../js/ai/pipeline.js');

  // Modular Configurations & Context Container
  const { CONFIG } = await import('../js/config/index.js');
  const { appContext } = await import('../js/core/app-context.js');
  const { serviceRegistry } = await import('../js/core/service-registry.js');

  // 2. BaseManager Standardized Lifecycles
  class TestService extends BaseManager {
    constructor() {
      super('1.2.3');
    }
  }
  const svc = new TestService();
  assert(!svc.initialized, 'Manager not initialized on constructor initialization');
  
  svc.initialize(appContext);
  assert(svc.initialized, 'Manager initialized after calling initialize()');
  
  const status = svc.getStatus();
  assert(status.initialized === true && status.version === '1.2.3' && status.healthy === true, 'getStatus() matches standardized structure');

  svc.dispose();
  assert(!svc.initialized, 'Manager initialized re-set to false after calling dispose()');

  // 3. Rolling History buffers checks
  const history = new RollingHistory(3);
  history.push({ value: 10 });
  history.push({ value: 20 });
  history.push({ value: 30 });
  history.push({ value: 40 }); // shifts out first item
  
  assert(history.size() === 3, 'RollingHistory cap limits to configured size');
  assert(history.latest().value === 40, 'RollingHistory latest() points to last item pushed');
  assert(history.toArray()[0].value === 20, 'RollingHistory shifts first item correctly');
  assert(history.average(x => x.value) === 30, 'RollingHistory average(selector) matches expectation');

  // 4. Grouped Event constants structure
  assert(typeof EVENTS.SYSTEM === 'object' && typeof EVENTS.AI === 'object', 'Event constants are grouped under domain headers');
  assert(EVENTS.SIMULATION.SIMULATION_FRAME === 'SIMULATION_FRAME', 'EVENTS map contains SIMULATION_FRAME key');

  // 5. AppContext & Dependency Container Immutability
  if (!appContext.has('config')) {
    appContext.register('config', CONFIG);
    appContext.register('eventBus', eventBus);
    appContext.register('store', store);
    appContext.register('shellStore', shellStore);
    appContext.register('aiRegistry', aiRegistry);
    appContext.register('engineMetrics', engineMetrics);
    appContext.register('themeManager', themeManager);
    appContext.register('dockManager', dockManager);
    appContext.register('workspaceManager', workspaceManager);
    appContext.register('notificationManager', notificationManager);
    appContext.register('shortcutManager', shortcutManager);
    appContext.register('focusManager', focusManager);
    appContext.register('layoutManager', layoutManager);
    appContext.initialize();
  }
  
  assert(appContext.get('config') === CONFIG, 'AppContext retrieves dependencies correctly');
  assert(Object.isFrozen(appContext), 'AppContext container object is frozen and immutable');
  try {
    appContext.register('another', {});
    assert(false, 'Should throw error when registering after initialization');
  } catch (err) {
    assert(true, 'AppContext throws error when registering after initialization');
  }

  // 6. ServiceRegistry Lifecycle Coordinator
  serviceRegistry.clear();
  let initCount = 0;
  let disposeCount = 0;
  class MockLifecycleService extends BaseManager {
    initialize(context) {
      super.initialize(context);
      initCount++;
    }
    dispose() {
      super.dispose();
      disposeCount++;
    }
  }

  const mockSvc = new MockLifecycleService();
  serviceRegistry.register('mockService', mockSvc);
  
  assert(serviceRegistry.has('mockService'), 'ServiceRegistry registers service instances');
  serviceRegistry.initializeAll(appContext);
  assert(mockSvc.initialized && initCount === 1, 'ServiceRegistry calls initializeAll correctly');
  
  serviceRegistry.disposeAll();
  assert(!mockSvc.initialized && disposeCount === 1, 'ServiceRegistry calls disposeAll correctly');

  // 6.5 Domain Models & BaseModel validations
  const { CrowdZone } = await import('../js/models/CrowdZone.js');
  const { ZoneStatus } = await import('../js/models/enums/ZoneStatus.js');
  const { uuid } = await import('../js/utils/id.js');
  const { serialize, deserialize } = await import('../js/utils/serializer.js');

  const zone = new CrowdZone({ zone: 'North Gate', occupancy: 100, capacity: 200, status: ZoneStatus.NORMAL });
  assert(zone.validate(), 'CrowdZone validates valid inputs correctly');
  
  const invalidZone = new CrowdZone({ zone: '', occupancy: -5, capacity: 10 });
  assert(!invalidZone.validate(), 'CrowdZone validation fails invalid inputs');

  // BaseModel clone, freeze, merge, equals checks
  const clonedZone = zone.clone();
  assert(clonedZone.equals(zone), 'BaseModel equals and clone utilities correctly duplicate state');
  
  const mergedZone = zone.merge({ occupancy: 150 });
  assert(mergedZone.occupancy === 150 && mergedZone.zone === 'North Gate', 'BaseModel merge returns modified clone');

  // Serialization utility checks
  const serialized = serialize(zone);
  const deserialized = deserialize(serialized, CrowdZone);
  assert(deserialized.equals(zone), 'Serializer correctly serializes and deserializes objects');

  // ID generation validation
  const generatedId = uuid();
  const { isUUID } = await import('../js/core/validators.js');
  assert(isUUID(generatedId), 'ID Generator generates valid UUID v4 formats');

  // 6.7 Scene Graph & Spatial Engine checks
  const { sceneGraph } = await import('../js/ui/digital-twin/scene/SceneGraph.js');
  const { SceneFactory } = await import('../js/ui/digital-twin/scene/SceneFactory.js');
  const { GridIndex } = await import('../js/ui/digital-twin/spatial/GridIndex.js');
  const { SelectionManager } = await import('../js/ui/digital-twin/spatial/SelectionManager.js');
  const { HitTest } = await import('../js/ui/digital-twin/spatial/HitTest.js');
  const { VisibilityManager } = await import('../js/ui/digital-twin/spatial/VisibilityManager.js');
  const { geometryCache } = await import('../js/ui/digital-twin/spatial/GeometryCache.js');
  const { ViewFrustum } = await import('../js/ui/digital-twin/spatial/ViewFrustum.js');
  const { CoordinateSystem } = await import('../js/ui/digital-twin/CoordinateSystem.js');

  sceneGraph.clear();
  const testNode = SceneFactory.createCrowdNode(zone);
  sceneGraph.addNode(testNode);
  assert(sceneGraph.getNode(testNode.id) === testNode, 'SceneGraph preserves and returns registered SceneNodes');

  // Spatial GridIndex checks
  const index = new GridIndex(600, 500, 50);
  index.insert(testNode);
  const foundNodes = index.query(testNode.bounds);
  assert(foundNodes.length === 1 && foundNodes[0].id === testNode.id, 'GridIndex correctly inserts and indexes bounds coordinates');

  // SelectionManager checks
  const selMgr = new SelectionManager();
  selMgr.select(testNode.id);
  assert(selMgr.getSelection()[0] === testNode.id, 'SelectionManager logs active selection keys');

  // Hit Testing checks
  const hit = new HitTest(index);
  const hitResult = hit.findAtPoint(testNode.position);
  assert(hitResult !== null && hitResult.id === testNode.id, 'HitTest resolves screen coordinates to correct SceneNode');

  // GeometryCache checks
  geometryCache.set('stadium-path-key', 'M 0 0 L 10 10 Z');
  assert(geometryCache.get('stadium-path-key') === 'M 0 0 L 10 10 Z', 'GeometryCache resolves Cached SVG geometry paths');

  // ViewFrustum culling checks
  const cSys = new CoordinateSystem(600, 500);
  cSys.fitToViewport(600, 500);
  const frustum = new ViewFrustum(cSys);
  assert(frustum.contains(testNode.bounds), 'ViewFrustum accurately checks bounds inclusion inside the viewport frustum');

  const visMgr = new VisibilityManager();
  assert(visMgr.isVisible(testNode, frustum), 'VisibilityManager evaluates nodes visibility correctly');

  // 6.8 Visualization Component Library checks
  const { ProgressRing } = await import('../js/ui/components/visualizations/ProgressRing.js');
  const { Gauge } = await import('../js/ui/components/visualizations/Gauge.js');
  const { Sparkline } = await import('../js/ui/components/visualizations/Sparkline.js');
  const { SeverityBadge } = await import('../js/ui/components/visualizations/SeverityBadge.js');
  const { StatusChip } = await import('../js/ui/components/visualizations/StatusChip.js');

  const pRing = new ProgressRing({ value: 75 });
  const pRingVNode = pRing.render();
  assert(pRingVNode.children[0].props['aria-label'] === 'Progress: 75%', 'ProgressRing renders responsive SVG rings with labels');

  const gauge = new Gauge({ value: 50, warningThreshold: 60 });
  const gaugeVNode = gauge.render();
  assert(gaugeVNode.children[0].props['aria-label'] === 'Gauge reading: 50%', 'Gauge renders SVG dials matching values');

  const spark = new Sparkline({ values: [10, 20, 15] });
  const sparkVNode = spark.render();
  assert(sparkVNode.tag === 'svg', 'Sparkline renders SVG line graphs');

  const badge = new SeverityBadge({ severity: 'CRITICAL' });
  const badgeVNode = badge.render();
  assert(badgeVNode.children[0] === 'CRITICAL' || badgeVNode.children[0].props.nodeValue === 'CRITICAL', 'SeverityBadge formats severity status text strings');

  const chip = new StatusChip({ status: 'HEALTHY' });
  const chipVNode = chip.render();
  assert(chipVNode.children[0].children[0].props.nodeValue === 'HEALTHY', 'StatusChip displays formatted status details');

  // 7. Push-Based Engine Metrics
  engineMetrics.initialize(appContext);
  engineMetrics.reset();
  engineMetrics.register('test-engine');
  engineMetrics.record('test-engine', 1.5, 0.95, true, false);
  engineMetrics.record('test-engine', 2.5, 0.85, true, false);
  engineMetrics.record('test-engine', 0, 0, false, true);

  const metrics = engineMetrics.getMetrics();
  assert(metrics['test-engine'] !== undefined, 'Engine metrics contains entries for test-engine');
  assert(metrics['test-engine'].executionCount === 3, 'Engine metrics execution count increments correctly');
  assert(metrics['test-engine'].averageRuntimeMs === 2.0, 'Engine metrics average runtime calculated correctly');
  assert(metrics['test-engine'].failureCount === 1, 'Engine metrics failure count increments correctly');
  assert(metrics['test-engine'].warningCount === 1, 'Engine metrics warning count increments');

  // 8. Command Registry with Rich Metadata
  commandRegistry.initialize(appContext);
  commandRegistry.clear();
  let executedCount = 0;
  commandRegistry.register({
    id: 'test-cmd',
    title: 'Test Command',
    description: 'Runs test execution',
    category: 'UI',
    shortcut: 'Ctrl+T',
    execute: () => { executedCount++; }
  });

  const cmd = commandRegistry.get('test-cmd');
  assert(cmd.shortcut === 'Ctrl+T' && cmd.category === 'UI', 'Command registry preserves rich metadata details');
  cmd.execute();
  assert(executedCount === 1, 'CommandRegistry executes actions correctly');

  // 9. Notification Queue and Center separation
  notificationManager.initialize(appContext);
  notificationManager.clearAll();
  const notifId = notificationManager.addNotification({ message: 'Sensor overload warning', type: 'warning', priority: 'medium' });
  const doubleId = notificationManager.addNotification({ message: 'Sensor overload warning', type: 'warning', priority: 'medium' });
  
  assert(notifId === doubleId, 'NotificationManager deduplicates duplicate entries');
  assert(notificationManager.getNotifications().length === 1, 'NotificationManager queue does not double queue');

  // 10. Dock Layout persistence
  shellStore.initialize(appContext);
  dockManager.initialize(appContext);
  dockManager.resetLayout();
  dockManager.setPanelVisibility('digital-twin', false);
  
  const saved = dockManager.exportLayout();
  assert(saved !== null && saved.includes('digital-twin":false'), 'DockManager exports and persists panel layouts');

  // 11. ShellState Isolation
  shellStore.setState({ workspaceLayout: 'fullscreen' });
  assert(shellStore.getState().workspaceLayout === 'fullscreen', 'ShellStore updates UI layout states');
  assert(store.getState().simulation.latestFrame === null, 'ShellStore remains isolated from Simulation Frame Store');

  // 12. AI Pipeline Lifecycle & Execution
  const { CrowdPredictionEngine } = await import('../js/ai/engines/crowd-prediction.js');
  const { ThreatAnalysisEngine } = await import('../js/ai/engines/threat-analysis.js');
  const { IntelligentRoutingEngine } = await import('../js/ai/engines/intelligent-routing.js');

  aiRegistry.clear();
  aiRegistry.register('crowd-prediction', new CrowdPredictionEngine());
  aiRegistry.register('threat-analysis', new ThreatAnalysisEngine());
  aiRegistry.register('intelligent-routing', new IntelligentRoutingEngine());

  aiPipeline.initialize(appContext);
  const mockSimulationFramePayload = {
    timestamp: 20.0,
    behaviors: {
      CrowdSimulation: {
        entities: [{ zone: 'North Stand', occupancy: 80 }],
        metrics: { totalOccupancy: 60, inflowRate: 10 }
      },
      IncidentSimulation: {
        entities: [],
        metrics: { activeCount: 0, criticalCount: 0 }
      }
    }
  };

  let pipelineCompleted = false;
  eventBus.subscribe(EVENTS.AI.AI_DECISION_FRAME, () => {
    pipelineCompleted = true;
  });

  eventBus.publish(EVENTS.SIMULATION.SIMULATION_FRAME, mockSimulationFramePayload);

  assert(pipelineCompleted, 'AiPipeline coordinates analyze and aggregates frame output');
  
  const pipelineMetrics = aiPipeline.getMetrics();
  assert(pipelineMetrics.framesProcessed === 1, 'AiPipeline aggregates performance statistics');

  // 13. Spam Ctrl+K Toggle Test (CommandPalette Invariants & Deduplication Verification)
  const { ApplicationShell } = await import('../js/ui/shell/application-shell.js');
  const { Component } = await import('../js/core/component.js');
  const { dashboardRegistry } = await import('../js/core/dashboard-registry.js');
  
  const testAppContainer = document.createElement('div');
  testAppContainer.id = 'app';
  
  class DummyPanel extends Component {
    render() {
      return h('div', { className: 'dummy-panel' }, 'Dummy content');
    }
  }

  dashboardRegistry.clear();
  dashboardRegistry.register({
    id: 'digital-twin',
    title: 'Digital Twin',
    component: DummyPanel,
    visible: true
  });

  const testShell = new ApplicationShell();
  testShell.mount(testAppContainer);

  console.log('\n[TEST] Spamming CommandPalette (Ctrl+K) 100 times to verify Null-DOM and Invariant safety...');
  
  let hadDiagnosticWarning = false;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.warn = (...args) => {
    if (args[0] && args[0].includes('NULL_DOM')) {
      hadDiagnosticWarning = true;
    }
    originalConsoleWarn.apply(console, args);
  };
  console.error = (...args) => {
    if (args[0] && (args[0].includes('DOM IS UNDEFINED') || args[0].includes('updateDOMProperties called with null DOM'))) {
      hadDiagnosticWarning = true;
    }
    originalConsoleError.apply(console, args);
  };

  for (let i = 0; i < 100; i++) {
    shellStore.setState({ commandPaletteOpen: !shellStore.getState().commandPaletteOpen });
  }

  // Restore console methods
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;

  assert(!hadDiagnosticWarning, 'Spamming CommandPalette toggles triggers NO null-DOM warnings or invariant violations');
  console.log('[TEST] Spamming test completed successfully. Zero warnings triggered.');

  // 14. SVG Namespace and Attribute Normalization Test
  console.log('\n[TEST] Verifying SVG namespace-aware element creation and attribute normalization...');
  const { createDOM } = await import('../js/core/renderer.js');
  
  const mockSvgVNode = h('svg', { id: 'test-svg-root' }, [
    h('ellipse', { id: 'test-ellipse', strokeWidth: '2.5', fillOpacity: '0.45' })
  ]);
  
  const svgDom = createDOM(mockSvgVNode);
  assert(svgDom.namespaceURI === "http://www.w3.org/2000/svg", 'svg.namespaceURI === "http://www.w3.org/2000/svg"');
  
  const ellipseDom = svgDom.childNodes[0];
  assert(ellipseDom.tag === 'ellipse', 'ellipse child is present');
  assert(ellipseDom instanceof SVGElement === true, 'ellipse instanceof SVGElement === true');
  assert(ellipseDom.namespaceURI === "http://www.w3.org/2000/svg", 'ellipse.namespaceURI === "http://www.w3.org/2000/svg"');
  
  // Verify attribute normalization
  assert(ellipseDom.props['stroke-width'] === '2.5', 'strokeWidth is normalized to stroke-width');
  assert(ellipseDom.props['fill-opacity'] === '0.45', 'fillOpacity is normalized to fill-opacity');
  assert(ellipseDom.props['strokeWidth'] === undefined, 'camelCase strokeWidth is removed');
  
  console.log('[TEST] SVG namespace and attribute normalization tests passed successfully!');

  console.log('\n=================================================');
  if (testsFailed === 0) {
    console.log('\x1b[32;1mALL ARCHITECTURE INTEGRATION TESTS PASSED SUCCESSFULLY\x1b[0m');
    console.log('=================================================\n');
    process.exit(0);
  } else {
    console.error(`\x1b[31;1m${testsFailed} TEST(S) FAILED\x1b[0m`);
    console.log('=================================================\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled failure during test execution:', err);
  process.exit(1);
});
