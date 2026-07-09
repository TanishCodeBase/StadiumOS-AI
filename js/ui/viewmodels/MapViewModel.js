import { CrowdViewModel } from './CrowdViewModel.js';
import { PersonnelViewModel } from './PersonnelViewModel.js';
import { TransitViewModel } from './TransitViewModel.js';
import { RouteViewModel } from './RouteViewModel.js';
import { HeatmapViewModel } from './HeatmapViewModel.js';
import { IncidentViewModel } from './IncidentViewModel.js';

export class MapViewModel {
  constructor(latestFrame, latestDecisionFrame) {
    const crowd = latestFrame?.behaviors?.CrowdSimulation || null;
    const responders = latestFrame?.behaviors?.TelemetrySimulation || null;
    const volunteers = latestFrame?.behaviors?.VolunteerSimulation || null;
    const transit = latestFrame?.behaviors?.TransitSimulation || null;

    this.crowd = new CrowdViewModel(crowd);
    this.personnel = new PersonnelViewModel(responders, volunteers);
    this.transit = new TransitViewModel(transit);
    this.routes = new RouteViewModel(latestDecisionFrame);
    this.heatmap = new HeatmapViewModel(crowd);
    this.incidents = new IncidentViewModel(latestFrame);

    this.timestamp = latestFrame?.timestamp || Date.now();
    this.tick = latestFrame?.tick || 0;
  }
}
export default MapViewModel;
