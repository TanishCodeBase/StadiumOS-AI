import { Responder } from '../../models/Responder.js';
import { Volunteer } from '../../models/Volunteer.js';

export class PersonnelViewModel {
  constructor(responderData, volunteerData) {
    this.responders = [];
    this.volunteers = [];

    // Parse raw responders array
    const rawResponders = Array.isArray(responderData) ? responderData : (responderData?.entities || []);
    this.responders = rawResponders.map(r => Responder.from(r)).filter(Boolean);

    // Parse raw volunteers array
    const rawVolunteers = Array.isArray(volunteerData) ? volunteerData : (volunteerData?.entities || []);
    this.volunteers = rawVolunteers.map(v => Volunteer.from(v)).filter(Boolean);
  }

  getResponderMarkerColor(type) {
    switch (type) {
      case 'MEDICAL': return '#ec4899'; // Pink
      case 'SECURITY': return '#3b82f6'; // Blue
      case 'FIRE': return '#f97316'; // Orange
      case 'STAFF': return '#eab308'; // Yellow
      default: return '#6b7280'; // Gray
    }
  }

  getResponderStatusColor(status) {
    switch (status) {
      case 'AVAILABLE': return '#10b981'; // Green
      case 'BUSY': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  }
}
export default PersonnelViewModel;
