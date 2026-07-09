import { logger } from './diagnostics/logger.js';
import { eventBus } from './core/event-bus.js';
import { store } from './core/store.js';
import { themeManager } from './core/theme-manager.js';
import { layoutManager } from './core/layout-manager.js';
import { dashboardRegistry } from './core/dashboard-registry.js';
import { simulationManager } from './simulation/manager.js';
import { CONFIG } from './config/index.js';
import { EVENTS } from './core/events.js';

// AppContext & ServiceRegistry Core
import { appContext } from './core/app-context.js';
import { serviceRegistry } from './core/service-registry.js';

// Shell Infrastructure Managers
import { shellStore } from './ui/shell/shell-store.js';
import { dockManager } from './ui/shell/dock-manager.js';
import { commandRegistry } from './ui/shell/command-registry.js';
import { shortcutManager } from './ui/shell/shortcut-manager.js';
import { focusManager } from './ui/shell/focus-manager.js';
import { notificationManager } from './ui/shell/notification-manager.js';
import { workspaceManager } from './ui/shell/workspace-manager.js';

// Components
import { ApplicationShell } from './ui/shell/application-shell.js';

// AI Core & Engines
import { aiRegistry } from './ai/registry.js';
import { aiPipeline } from './ai/pipeline.js';
import { CrowdPredictionEngine } from './ai/engines/crowd-prediction.js';
import { ThreatAnalysisEngine } from './ai/engines/threat-analysis.js';
import { IntelligentRoutingEngine } from './ai/engines/intelligent-routing.js';

// Panel Components
import { DigitalTwinPanel } from './ui/components/panels.js';
import { RecommendationPanel } from './ui/panels/RecommendationPanel.js';
import { IncidentPanel } from './ui/panels/IncidentPanel.js';
import { engineMetrics } from './diagnostics/engine-metrics.js';
import { OperationsTimeline } from './ui/panels/OperationsTimeline.js';
import { HealthDashboard } from './ui/panels/HealthDashboard.js';
import { TransportPanel } from './ui/panels/TransportPanel.js';
import { VolunteerPanel } from './ui/panels/VolunteerPanel.js';
import { EmergencyConsole } from './ui/panels/EmergencyConsole.js';
import { SystemStatusPanel } from './ui/panels/SystemStatusPanel.js';
import { LayerControlsPanel } from './ui/panels/LayerControlsPanel.js';
import { AiExplanationPanel } from './ui/panels/AiExplanationPanel.js';

// Setup bootstrap sequence
function bootstrap() {
  logger.info('System', 'StadiumOS AI: Initiating Bootstrap Sequence...');

  // 1. Register Core Dependencies inside AppContext Container
  appContext.register('config', CONFIG);
  appContext.register('logger', logger);
  appContext.register('eventBus', eventBus);
  appContext.register('store', store);
  appContext.register('shellStore', shellStore);
  appContext.register('serviceRegistry', serviceRegistry);

  // Register Manager Singletons
  appContext.register('themeManager', themeManager);
  appContext.register('dockManager', dockManager);
  appContext.register('workspaceManager', workspaceManager);
  appContext.register('notificationManager', notificationManager);
  appContext.register('shortcutManager', shortcutManager);
  appContext.register('focusManager', focusManager);
  appContext.register('engineMetrics', engineMetrics);
  appContext.register('layoutManager', layoutManager);
  appContext.register('dashboardRegistry', dashboardRegistry);
  appContext.register('simulationManager', simulationManager);
  appContext.register('aiPipeline', aiPipeline);
  appContext.register('aiRegistry', aiRegistry);
  appContext.register('commandRegistry', commandRegistry);

  // Freeze container reference to ensure immutability
  appContext.initialize();

  // 2. Register Services in lifecycle ServiceRegistry
  serviceRegistry.register('themeManager', themeManager);
  serviceRegistry.register('shellStore', shellStore);
  serviceRegistry.register('dockManager', dockManager);
  serviceRegistry.register('workspaceManager', workspaceManager);
  serviceRegistry.register('notificationManager', notificationManager);
  serviceRegistry.register('shortcutManager', shortcutManager);
  serviceRegistry.register('focusManager', focusManager);
  serviceRegistry.register('engineMetrics', engineMetrics);
  serviceRegistry.register('commandRegistry', commandRegistry);
  serviceRegistry.register('simulationManager', simulationManager);
  serviceRegistry.register('aiPipeline', aiPipeline);

  // 3. Initialize all services sequentially in priority registration order
  serviceRegistry.initializeAll(appContext);

  // 4. Register Dashboard Panels (dynamic registrations)
  dashboardRegistry.register({
    id: 'digital-twin',
    title: 'Digital Twin',
    component: DigitalTwinPanel,
    area: 'main',
    order: 1,
    minWidth: 6,
    minHeight: 4,
    resizable: true,
    visible: true,
    defaultProps: { description: 'Real-time spatial visualization overlay of crowd densities, gates, and deployment vectors.' }
  });

  dashboardRegistry.register({
    id: 'ai-recommendations',
    title: 'AI Recommendations',
    component: RecommendationPanel,
    area: 'sidebar',
    order: 2,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Operations decision support models, explainable suggestions, and routing adjustments.' }
  });

  dashboardRegistry.register({
    id: 'incidents',
    title: 'Incidents',
    component: IncidentPanel,
    area: 'sidebar',
    order: 3,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Priority logs for medical, security, and infrastructure alerts.' }
  });

  dashboardRegistry.register({
    id: 'transport',
    title: 'Transport',
    component: TransportPanel,
    area: 'sidebar',
    order: 4,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Public transit nodes, metro schedules, and transit corridor occupancy.' }
  });

  dashboardRegistry.register({
    id: 'timeline',
    title: 'Operations Timeline',
    component: OperationsTimeline,
    area: 'sidebar',
    order: 5,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Sequential operations timeline log of past telemetry reports and action benchmarks.' }
  });

  dashboardRegistry.register({
    id: 'health',
    title: 'Health',
    component: HealthDashboard,
    area: 'footer-row',
    order: 6,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Sensor analytics, CPU load, and network communication throughput.' }
  });

  dashboardRegistry.register({
    id: 'emergency',
    title: 'Emergency',
    component: EmergencyConsole,
    area: 'footer-row',
    order: 7,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Dispatched emergency responders, medical tents, and fire unit coordinates.' }
  });

  dashboardRegistry.register({
    id: 'volunteers',
    title: 'Volunteers',
    component: VolunteerPanel,
    area: 'footer-row',
    order: 8,
    minWidth: 6,
    minHeight: 2,
    resizable: true,
    visible: true,
    defaultProps: { description: 'Staff allocation telemetry and volunteer check-in gates.' }
  });

  dashboardRegistry.register({
    id: 'system-status',
    title: 'System Status',
    component: SystemStatusPanel,
    area: 'footer-row',
    order: 9,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Telemetry health statistics of core worker modules.' }
  });

  dashboardRegistry.register({
    id: 'layer-controls',
    title: 'Layer Visibility',
    component: LayerControlsPanel,
    area: 'footer-row',
    order: 10,
    minWidth: 3,
    minHeight: 2,
    resizable: false,
    visible: true,
    defaultProps: { description: 'Interactive toggle controls for Digital Twin overlays.' }
  });

  dashboardRegistry.register({
    id: 'ai-explanation',
    title: 'AI Decision Support',
    component: AiExplanationPanel,
    area: 'footer-row',
    order: 11,
    minWidth: 3,
    minHeight: 3,
    resizable: true,
    visible: true,
    defaultProps: { description: 'Detailed reasoning explanations and predicted impacts for active dispatches.' }
  });

  // 5. Register Commands inside commandRegistry
  commandRegistry.register({
    id: 'toggle-simulation',
    title: 'Toggle Simulation Play/Pause',
    description: 'Toggles the background ticking simulation clock loop',
    category: 'Simulation',
    shortcut: 'Space',
    icon: '⏳',
    execute: () => store.dispatch({ type: 'TOGGLE_SIMULATION' })
  });

  commandRegistry.register({
    id: 'reset-dock-layout',
    title: 'Reset Dock Layout Presets',
    description: 'Restores workspace panel layouts and visibility parameters',
    category: 'UI',
    shortcut: 'Ctrl+D',
    icon: '🔄',
    execute: () => dockManager.resetLayout()
  });

  commandRegistry.register({
    id: 'toggle-sidebar',
    title: 'Toggle Left Sidebar View',
    description: 'Toggles sidebar system health and operations control panels',
    category: 'UI',
    shortcut: 'Ctrl+/',
    icon: '📁',
    execute: () => shellStore.setState({ sidebarOpen: !shellStore.getState().sidebarOpen })
  });

  commandRegistry.register({
    id: 'diagnostics-ping',
    title: 'Trigger Diagnostics Alert',
    description: 'Queues a diagnostic warning alert into NotificationCenter',
    category: 'Diagnostics',
    shortcut: '',
    icon: '🔔',
    execute: () => notificationManager.addNotification({
      message: 'Diagnostics NOC check requested: High network telemetry packet loads.',
      type: 'warning',
      priority: 'medium'
    })
  });

  // 6. Register Keyboard Shortcuts
  shortcutManager.register('ctrl+k', () => {
    shellStore.setState({ commandPaletteOpen: !shellStore.getState().commandPaletteOpen });
  }, 'Toggle Command Palette');

  shortcutManager.register('ctrl+/', () => {
    shellStore.setState({ sidebarOpen: !shellStore.getState().sidebarOpen });
  }, 'Toggle Sidebar');

  shortcutManager.register('escape', () => {
    if (shellStore.getState().commandPaletteOpen) {
      shellStore.setState({ commandPaletteOpen: false });
    }
  }, 'Close Dialogs');

  shortcutManager.register(' ', () => {
    const focused = document.activeElement;
    if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')) return;
    store.dispatch({ type: 'TOGGLE_SIMULATION' });
  }, 'Play/Pause Simulation');

  // 7. Register AI Engines
  aiRegistry.register('crowd-prediction', new CrowdPredictionEngine());
  aiRegistry.register('threat-analysis', new ThreatAnalysisEngine());
  aiRegistry.register('intelligent-routing', new IntelligentRoutingEngine());

  // 8. Wire Unidirectional State Flow for Simulation & AI Controllers
  store.subscribe((state, prevState) => {
    if (state.simulation.isPlaying !== prevState.simulation.isPlaying) {
      if (state.simulation.isPlaying) {
        simulationManager.start();
        notificationManager.addNotification({ message: 'Simulation clock started.', type: 'success' });
      } else {
        simulationManager.pause();
        notificationManager.addNotification({ message: 'Simulation clock paused.', type: 'info' });
      }
    }
    if (state.simulation.speed !== prevState.simulation.speed) {
      simulationManager.setSpeed(state.simulation.speed);
      notificationManager.addNotification({ message: `Simulation speed set to ${state.simulation.speed}x.`, type: 'info' });
    }
  });

  // Wire EventBus frame updates to trigger store actions
  eventBus.subscribe(EVENTS.SIMULATION.SIMULATION_FRAME, (frame) => {
    store.dispatch({ type: EVENTS.SIMULATION.SIMULATION_FRAME, payload: frame });
  });

  // Wire EventBus AI decisions to update store state
  eventBus.subscribe(EVENTS.AI.AI_DECISION_FRAME, (decisionFrame) => {
    store.dispatch({ type: EVENTS.AI.AI_DECISION_FRAME, payload: decisionFrame });
  });

  // 9. Mount Application Shell
  const appContainer = document.getElementById('app');
  if (!appContainer) {
    logger.error('System', 'Bootstrap: Critical Error - #app container element not found in HTML!');
    return;
  }

  logger.info('System', 'Bootstrap: Initializing Custom DOM and Mounting Shell...');
  const shell = new ApplicationShell();
  shell.mount(appContainer);

  // 10. Dispatch startup status
  store.dispatch({
    type: 'UPDATE_STATUS',
    payload: {
      message: 'StadiumOS AI Core & Enterprise Service Registry Bootstrapped.',
      fps: 60,
      memory: '40.6 MB'
    }
  });

  logger.info('System', 'StadiumOS AI: Bootstrap Completed Successfully.');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
