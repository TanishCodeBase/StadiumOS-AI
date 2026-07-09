import { SceneNode } from './SceneNode.js';

export class GateNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'GATE' });
  }
}
export default GateNode;
