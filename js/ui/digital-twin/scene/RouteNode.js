import { SceneNode } from './SceneNode.js';

export class RouteNode extends SceneNode {
  constructor(props) {
    super({ ...props, type: 'ROUTE' });
  }
}
export default RouteNode;
