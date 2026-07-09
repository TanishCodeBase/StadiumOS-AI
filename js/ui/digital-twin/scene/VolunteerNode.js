import { SceneNode } from './SceneNode.js';

export class VolunteerNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'VOLUNTEER' });
  }
}
export default VolunteerNode;
