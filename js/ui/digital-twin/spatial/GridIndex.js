export class GridIndex {
  constructor(width = 600, height = 500, cellSize = 50) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = Array.from({ length: this.cols * this.rows }, () => new Set());
    this.nodeCells = new Map(); // tracks cells containing each node id
  }

  insert(node) {
    if (!node || !node.id || !node.bounds) return;

    // Calculate grid cell coordinate range overlapping node bounds
    const cells = this._getCellIndices(node.bounds);
    this.nodeCells.set(node.id, cells);

    cells.forEach(idx => {
      if (this.grid[idx]) {
        this.grid[idx].add(node);
      }
    });
  }

  remove(node) {
    if (!node || !node.id) return;
    const cells = this.nodeCells.get(node.id);
    if (cells) {
      cells.forEach(idx => {
        if (this.grid[idx]) {
          this.grid[idx].forEach(item => {
            if (item.id === node.id) {
              this.grid[idx].delete(item);
            }
          });
        }
      });
      this.nodeCells.delete(node.id);
    }
  }

  update(node) {
    this.remove(node);
    this.insert(node);
  }

  query(bounds) {
    if (!bounds) return [];
    const cells = this._getCellIndices(bounds);
    const result = new Set();

    cells.forEach(idx => {
      if (this.grid[idx]) {
        this.grid[idx].forEach(node => {
          if (this._intersects(node.bounds, bounds)) {
            result.add(node);
          }
        });
      }
    });

    return Array.from(result);
  }

  nearest(point) {
    if (!point) return null;
    let closestNode = null;
    let minDistance = Infinity;

    this.grid.forEach(cell => {
      cell.forEach(node => {
        const dx = node.position.x - point.x;
        const dy = node.position.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestNode = node;
        }
      });
    });

    return closestNode;
  }

  withinRadius(point, radius) {
    if (!point) return [];
    const result = [];
    this.grid.forEach(cell => {
      cell.forEach(node => {
        const dx = node.position.x - point.x;
        const dy = node.position.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= radius) {
          result.push(node);
        }
      });
    });
    return Array.from(new Set(result));
  }

  clear() {
    this.grid.forEach(cell => cell.clear());
    this.nodeCells.clear();
  }

  _getCellIndices(bounds) {
    const indices = [];
    const minCol = Math.max(0, Math.floor(bounds.x / this.cellSize));
    const maxCol = Math.min(this.cols - 1, Math.floor((bounds.x + bounds.width) / this.cellSize));
    const minRow = Math.max(0, Math.floor(bounds.y / this.cellSize));
    const maxRow = Math.min(this.rows - 1, Math.floor((bounds.y + bounds.height) / this.cellSize));

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        indices.push(row * this.cols + col);
      }
    }
    return indices;
  }

  _intersects(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
export default GridIndex;
