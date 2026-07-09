import { SceneNode } from './SceneNode.js';

export class MedicalNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'MEDICAL' });
  }
}
export default MedicalNode;
