export class SelectionManager {
  constructor() {
    this.selectedIds = new Set();
    this.hoveredId = null;
    this.history = [];
  }

  select(id) {
    this.selectedIds.clear();
    if (id) {
      this.selectedIds.add(id);
      this.history.push(id);
      if (this.history.length > 50) this.history.shift();
    }
  }

  toggle(id) {
    if (!id) return;
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
      this.history.push(id);
    }
  }

  clear() {
    this.selectedIds.clear();
  }

  hover(id) {
    this.hoveredId = id || null;
  }

  getSelection() {
    return Array.from(this.selectedIds);
  }
}
export default SelectionManager;
