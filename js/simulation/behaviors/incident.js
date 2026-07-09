export class IncidentSimulation {
  constructor() {
    this.context = null;
    this.incidents = [];
    this.types = ['Medical Incident', 'Facility Failure', 'Security Breach', 'Crowd Congestion'];
    this.locations = ['Gate 3', 'Section 104', 'Concourse B', 'East Entrance', 'West Parking Area'];
    this.severities = ['LOW', 'MEDIUM', 'HIGH'];
  }

  initialize(context) {
    this.context = context;
    this.incidents = [];
  }

  start() {}

  stop() {}

  tick(deltaTime) {
    if (!this.context) return null;

    const events = [];

    // 1. Evolve existing incidents status
    this.incidents.forEach(inc => {
      if (inc.status === 'Created') {
        inc.status = 'Assigned';
        events.push({
          id: `EVT-${Math.floor(this.context.random() * 10000)}`,
          type: 'INCIDENT_ASSIGNED',
          message: `Responders assigned to incident ${inc.id} (${inc.type} at ${inc.location}).`,
          incidentId: inc.id
        });
      } else if (inc.status === 'Assigned') {
        inc.status = 'Responding';
        events.push({
          id: `EVT-${Math.floor(this.context.random() * 10000)}`,
          type: 'INCIDENT_RESPONDING',
          message: `Units are on-site responding to incident ${inc.id}.`,
          incidentId: inc.id
        });
      } else if (inc.status === 'Responding') {
        // 20% chance to resolve per tick
        if (this.context.random() < 0.2) {
          inc.status = 'Resolved';
          events.push({
            id: `EVT-${Math.floor(this.context.random() * 10000)}`,
            type: 'INCIDENT_RESOLVED',
            message: `Incident ${inc.id} (${inc.type} at ${inc.location}) resolved successfully.`,
            incidentId: inc.id
          });
        }
      } else if (inc.status === 'Resolved') {
        inc.status = 'Archived';
      }
    });

    // Remove archived incidents
    this.incidents = this.incidents.filter(inc => inc.status !== 'Archived');

    // 2. Chance to generate new incidents
    if (this.incidents.length < 5 && this.context.random() < 0.08 * deltaTime) {
      const newIncident = {
        id: `INC-${Math.floor(this.context.random() * 9000) + 1000}`,
        type: this.types[Math.floor(this.context.random() * this.types.length)],
        location: this.locations[Math.floor(this.context.random() * this.locations.length)],
        severity: this.severities[Math.floor(this.context.random() * this.severities.length)],
        status: 'Created',
        timestamp: this.context.clock
      };
      
      this.incidents.push(newIncident);
      events.push({
        id: `EVT-${Math.floor(this.context.random() * 10000)}`,
        type: 'INCIDENT_REPORTED',
        message: `Alert: ${newIncident.severity} priority ${newIncident.type} reported at ${newIncident.location}.`,
        incident: newIncident
      });
    }

    return {
      source: 'IncidentSimulation',
      timestamp: this.context.clock,
      entities: [...this.incidents],
      metrics: {
        activeCount: this.incidents.filter(i => i.status !== 'Resolved').length,
        criticalCount: this.incidents.filter(i => i.severity === 'HIGH').length
      },
      events
    };
  }

  dispose() {
    this.context = null;
    this.incidents = [];
  }
}
export default IncidentSimulation;
