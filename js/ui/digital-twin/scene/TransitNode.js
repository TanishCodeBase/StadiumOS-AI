import { SceneNode } from './SceneNode.js';

export class TransitNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'TRANSIT' });
  }
}
export default TransitNode;
