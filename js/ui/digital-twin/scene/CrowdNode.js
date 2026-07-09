import { SceneNode } from './SceneNode.js';

export class CrowdNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'CROWD' });
  }
}
export default CrowdNode;
