import { h } from '../../core/vdom.js';
import { BasePanel } from './BasePanel.js';
import { layerManager } from '../digital-twin/LayerManager.js';

export class LayerControlsPanel extends BasePanel {
  constructor(props) {
    super(props);
    
    // Subscribe to layer manager updates to force re-render when layers change
    const unsubscribe = layerManager.subscribe(() => {
      this.update();
    });
    this.addSubscription(unsubscribe);
  }

  render() {
    const layers = [
      { id: 'crowd', label: 'Spectator Crowd Stands', icon: '👥' },
      { id: 'heatmap', label: 'Density Heatmap', icon: '🔥' },
      { id: 'personnel', label: 'Responders & Staff', icon: '👮' },
      { id: 'transit', label: 'Transit Corridors', icon: '🚌' },
      { id: 'routes', label: 'AI Routing Paths', icon: '🗺️' },
      { id: 'cameras', label: 'Security Cameras', icon: '📹' },
      { id: 'incidents', label: 'Active Incidents Log', icon: '⚠️' }
    ];

    return this.renderCard('Layer Visibility', 'INTERACTIVE', 
      h('div', { 
        className: 'layer-controls-list',
        style: 'display: flex; flex-direction: column; gap: 8px; padding: 12px 14px;' 
      }, 
        layers.map(layer => {
          const isVisible = layerManager.isVisible(layer.id);
          
          return h('label', {
            key: layer.id,
            className: `layer-toggle-row ${isVisible ? 'active' : ''}`,
            style: 'display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 4px; cursor: pointer; transition: all 0.2s;'
          }, [
            h('div', { style: 'display: flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 500; color: #ffffff;' }, [
              h('span', { style: 'font-size: 14px;' }, layer.icon),
              h('span', null, layer.label)
            ]),
            h('input', {
              type: 'checkbox',
              checked: isVisible,
              style: 'cursor: pointer; width: 14px; height: 14px; accent-color: var(--color-primary);',
              onChange: (e) => {
                layerManager.toggle(layer.id);
              }
            })
          ]);
        })
      )
    );
  }
}

export default LayerControlsPanel;
