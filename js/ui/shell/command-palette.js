import { h } from '../../core/vdom.js';
import { Component } from '../../core/component.js';
import { shellStore } from './shell-store.js';
import { commandRegistry } from './command-registry.js';
import { focusManager } from './focus-manager.js';

export class CommandPalette extends Component {
  constructor(props) {
    super(props);
    // Initialize state with a synchronous snapshot only.
    // Reactive subscriptions are registered in onMount() to prevent
    // reentrant reconciliation during the initial mount cycle.
    this.state = {
      isOpen: shellStore.getState().commandPaletteOpen,
      searchQuery: '',
      selectedIndex: 0
    };
  }

  onMount() {
    // React to shell store toggles — safe after DOM is mounted
    const unsubscribeStore = shellStore.subscribe((state) => {
      const becameOpen = state.commandPaletteOpen && !this.state.isOpen;
      const becameClosed = !state.commandPaletteOpen && this.state.isOpen;

      this.setState({ isOpen: state.commandPaletteOpen });

      if (becameOpen) {
        // Reset query and indices
        this.setState({ searchQuery: '', selectedIndex: 0 });
        // Delay trap allocation to ensure node mounts
        setTimeout(() => {
          const container = document.getElementById('command-palette-modal');
          if (container) {
            focusManager.setFocusTrap(container);
            const input = container.querySelector('.palette-input');
            if (input) input.focus();
          }
        }, 30);
      } else if (becameClosed) {
        focusManager.clearFocusTrap();
      }
    });
    this.addSubscription(unsubscribeStore);
  }

  getFilteredCommands() {
    const query = this.state.searchQuery.toLowerCase().trim();
    const commands = commandRegistry.getAll().filter(c => c.enabled);
    if (!query) return commands;
    
    return commands.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    );
  }

  handleKeyDown(e) {
    const filtered = this.getFilteredCommands();
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.setState({
        selectedIndex: (this.state.selectedIndex + 1) % filtered.length
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.setState({
        selectedIndex: (this.state.selectedIndex - 1 + filtered.length) % filtered.length
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[this.state.selectedIndex];
      if (selected) {
        shellStore.setState({ commandPaletteOpen: false });
        selected.execute();
      }
    }
  }

  render() {
    if (!this.state.isOpen) return null;

    const filtered = this.getFilteredCommands();

    const cmdList = filtered.map((cmd, idx) => {
      const isSelected = idx === this.state.selectedIndex;
      return h('div', {
        className: `palette-item ${isSelected ? 'selected' : ''}`,
        onclick: () => {
          shellStore.setState({ commandPaletteOpen: false });
          cmd.execute();
        },
        key: cmd.id
      }, [
        h('span', { className: 'item-icon' }, cmd.icon),
        h('div', { className: 'item-info' }, [
          h('span', { className: 'item-title' }, cmd.title),
          h('span', { className: 'item-desc' }, cmd.description)
        ]),
        cmd.shortcut ? h('kbd', { className: 'item-shortcut' }, cmd.shortcut) : null
      ]);
    });

    return h('div', { 
      className: 'command-palette-backdrop',
      onclick: () => shellStore.setState({ commandPaletteOpen: false })
    }, [
      h('div', { 
        className: 'command-palette-modal', 
        id: 'command-palette-modal',
        onclick: (e) => e.stopPropagation(),
        onkeydown: (e) => this.handleKeyDown(e)
      }, [
        h('div', { className: 'palette-search-container' }, [
          h('span', { className: 'search-icon' }, '🔍'),
          h('input', {
            type: 'text',
            className: 'palette-input',
            placeholder: 'Search operations NOC commands...',
            value: this.state.searchQuery,
            oninput: (e) => this.setState({ searchQuery: e.target.value, selectedIndex: 0 })
          })
        ]),
        h('div', { className: 'palette-results-container' }, 
          cmdList.length > 0 
            ? cmdList 
            : h('div', { className: 'palette-no-results' }, 'No commands matched query')
        ),
        h('div', { className: 'palette-footer' }, [
          h('span', null, '↑↓ to navigate'),
          h('span', null, '↵ to execute'),
          h('span', null, 'ESC to exit')
        ])
      ])
    ]);
  }
}
export default CommandPalette;
