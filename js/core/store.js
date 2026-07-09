import { logger } from '../diagnostics/logger.js';
import { eventBus } from './event-bus.js';
import { EVENTS } from './events.js';

// Initial state of the system
const initialState = {
  app: {
    name: 'StadiumOS AI',
    version: '0.1.0',
    status: 'SYSTEM_OK',
    lastUpdated: new Date().toISOString()
  },
  systemStatus: {
    message: 'NOC Command Center Active',
    isOnline: true,
    fps: 60,
    memory: '32.4 MB',
    activeIncidents: 0
  },
  simulation: {
    isPlaying: false,
    speed: 1.0,
    tickCount: 0,
    latestFrame: null,
    latestDecisionFrame: null
  }
};

// Root reducer to handle state transformations
function rootReducer(state = initialState, action) {
  logger.debug('Store', `Reducer processing action '${action.type}'`, action.payload);

  switch (action.type) {
    case 'UPDATE_STATUS':
      return {
        ...state,
        systemStatus: {
          ...state.systemStatus,
          message: action.payload.message || state.systemStatus.message,
          isOnline: action.payload.isOnline !== undefined ? action.payload.isOnline : state.systemStatus.isOnline,
          fps: action.payload.fps !== undefined ? action.payload.fps : state.systemStatus.fps,
          memory: action.payload.memory !== undefined ? action.payload.memory : state.systemStatus.memory,
          activeIncidents: action.payload.activeIncidents !== undefined ? action.payload.activeIncidents : state.systemStatus.activeIncidents
        },
        app: {
          ...state.app,
          lastUpdated: new Date().toISOString()
        }
      };
    case 'TOGGLE_SIMULATION':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          isPlaying: !state.simulation.isPlaying
        }
      };
    case 'SET_SIMULATION_SPEED':
      return {
        ...state,
        simulation: {
          ...state.simulation,
          speed: action.payload
        }
      };
    case EVENTS.SIMULATION.SIMULATION_FRAME: {
      const frame = action.payload;
      const incidentBehavior = frame.behaviors.IncidentSimulation;
      const activeIncidents = incidentBehavior?.metrics?.activeCount !== undefined 
        ? incidentBehavior.metrics.activeCount 
        : state.systemStatus.activeIncidents;

      // Extract new alert message if available
      const latestEventMessage = incidentBehavior?.events?.[0]?.message;
      const statusMessage = latestEventMessage || state.systemStatus.message;

      return {
        ...state,
        simulation: {
          ...state.simulation,
          tickCount: state.simulation.tickCount + 1,
          latestFrame: frame
        },
        systemStatus: {
          ...state.systemStatus,
          activeIncidents,
          message: statusMessage
        },
        app: {
          ...state.app,
          lastUpdated: new Date().toISOString()
        }
      };
    }
    case EVENTS.AI.AI_DECISION_FRAME: {
      const decisionFrame = action.payload;
      // Map highest recommendation to status message if available
      const recommendationMsg = decisionFrame.recommendations?.[0]?.action;
      const statusMessage = recommendationMsg || state.systemStatus.message;

      return {
        ...state,
        simulation: {
          ...state.simulation,
          latestDecisionFrame: decisionFrame
        },
        systemStatus: {
          ...state.systemStatus,
          message: statusMessage
        },
        app: {
          ...state.app,
          lastUpdated: new Date().toISOString()
        }
      };
    }
    default:
      return state;
  }
}

class Store {
  constructor(reducer, preloadedState) {
    this.reducer = reducer;
    this.state = reducer(preloadedState, { type: '@@INIT' });
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    if (!action || typeof action.type !== 'string') {
      logger.error('Store', 'Action must be an object with a type string');
      return;
    }

    const previousState = this.state;
    this.state = this.reducer(this.state, action);
    
    logger.debug('Store', 'State updated', { before: previousState, after: this.state });

    // Notify internal store subscribers
    for (const listener of this.listeners) {
      try {
        listener(this.state, previousState);
      } catch (err) {
        logger.error('Store', 'Error in state listener', err);
      }
    }

    // Publish to global event bus using standard event constants
    eventBus.publish(EVENTS.SIMULATION.STATE_CHANGED, { state: this.state, action });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const store = new Store(rootReducer);
export default store;
