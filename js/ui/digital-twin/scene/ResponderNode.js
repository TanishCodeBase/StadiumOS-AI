import { SceneNode } from './SceneNode.js';

export class ResponderNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'RESPONDER' });
  }
}
export default ResponderNode;
