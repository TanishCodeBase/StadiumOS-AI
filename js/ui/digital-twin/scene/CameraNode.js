import { SceneNode } from './SceneNode.js';

export class CameraNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'CAMERA' });
  }
}
export default CameraNode;
