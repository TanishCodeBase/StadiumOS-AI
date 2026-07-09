import { SceneNode } from './SceneNode.js';

export class HeatNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'HEAT' });
  }
}
export default HeatNode;
