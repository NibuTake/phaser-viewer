import * as Phaser from 'phaser';

/**
 * Configuration options for the development grid system
 */
export interface GridSystemConfig {
  enabled?: boolean;           // Enable/disable grid system (default: false)
  showBounds?: boolean;        // Show scene boundaries (default: true when enabled)
  showGrid?: boolean;         // Show grid lines (default: true when enabled)
  gridSize?: number;          // Custom grid size (default: auto-calculated from divisions)
  gridDivisions?: number;     // Number of grid divisions (default: auto-calculated)
  gridColor?: number;         // Grid line color (default: 0x666666)
  gridAlpha?: number;         // Grid line alpha (default: 0.2)
  boundsColor?: number;       // Bounds line color (default: 0x00ff00)
  boundsAlpha?: number;       // Bounds line alpha (default: 0.5)
}

/**
 * Extended configuration with computed square grid properties
 */
interface ExtendedGridSystemConfig extends Required<GridSystemConfig> {
  divisionsX: number;
  divisionsY: number;
}

/**
 * Grid system for development assistance in Phaser scenes
 * Provides visual guides for component positioning and alignment
 */
export class GridSystem {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private config: ExtendedGridSystemConfig;
  private sceneWidth: number;
  private sceneHeight: number;

  constructor(scene: Phaser.Scene, config: GridSystemConfig = {}) {
    this.scene = scene;
    this.sceneWidth = scene.game.config.width as number;
    this.sceneHeight = scene.game.config.height as number;
    
    // Calculate optimal square grid divisions or use provided configuration
    const squareGridConfig = this.calculateSquareGridConfig(config.gridSize, config.gridDivisions);
    
    // Set default configuration with square grid properties
    this.config = {
      enabled: config.enabled ?? false,
      showBounds: config.showBounds ?? true,
      showGrid: config.showGrid ?? true,
      gridSize: squareGridConfig.cellSize,
      gridDivisions: squareGridConfig.divisions,
      gridColor: config.gridColor ?? 0x666666,
      gridAlpha: config.gridAlpha ?? 0.2,
      boundsColor: config.boundsColor ?? 0x00ff00,
      boundsAlpha: config.boundsAlpha ?? 0.5,
      divisionsX: squareGridConfig.divisionsX,
      divisionsY: squareGridConfig.divisionsY,
    };

    // Create graphics object
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(-1000); // Render behind everything
    
    console.log('🟩 GridSystem created:', {
      enabled: this.config.enabled,
      showGrid: this.config.showGrid,
      showBounds: this.config.showBounds,
      gridSize: this.config.gridSize,
      gridDivisions: this.config.gridDivisions,
      divisionsX: this.config.divisionsX,
      divisionsY: this.config.divisionsY,
      gridAlpha: this.config.gridAlpha,
      sceneSize: `${this.sceneWidth}x${this.sceneHeight}`
    });
    
    if (this.config.enabled) {
      this.draw();
      console.log('🟩 GridSystem draw() called');
    } else {
      console.log('🟩 GridSystem not enabled - skipping draw');
    }
  }

  /**
   * Calculate optimal square grid configuration that perfectly covers the scene
   */
  private calculateSquareGridConfig(providedSize?: number, providedDivisions?: number): {
    divisions: number;
    cellSize: number;
    divisionsX: number;
    divisionsY: number;
  } {
    const width = this.sceneWidth;
    const height = this.sceneHeight;

    // If user provided specific size or divisions, respect their choice
    if (providedSize) {
      const divisionsX = Math.round(width / providedSize);
      const divisionsY = Math.round(height / providedSize);
      return {
        divisions: Math.max(divisionsX, divisionsY), // Use max for backward compatibility
        cellSize: providedSize,
        divisionsX,
        divisionsY
      };
    }

    if (providedDivisions) {
      const cellSize = Math.min(width / providedDivisions, height / providedDivisions);
      return {
        divisions: providedDivisions,
        cellSize: Math.floor(cellSize),
        divisionsX: Math.round(width / cellSize),
        divisionsY: Math.round(height / cellSize)
      };
    }

    // Calculate optimal square grid automatically
    return this.calculateOptimalSquareGrid();
  }

  /**
   * Calculate optimal square grid cell size and divisions to perfectly cover scene
   * Returns configuration that creates square cells fitting the scene perfectly
   */
  private calculateOptimalSquareGrid(): {
    divisions: number;
    cellSize: number;
    divisionsX: number;
    divisionsY: number;
  } {
    const width = this.sceneWidth;
    const height = this.sceneHeight;
    
    // Target cell sizes in order of preference for square grids
    const targetCellSizes = [100, 120, 80, 150, 60, 200, 50, 40];
    
    // Find the best square cell size that fits both dimensions well
    for (const cellSize of targetCellSizes) {
      const divisionsX = Math.round(width / cellSize);
      const divisionsY = Math.round(height / cellSize);
      
      // Check if we can create reasonable divisions
      if (divisionsX >= 4 && divisionsY >= 4 && divisionsX <= 50 && divisionsY <= 50) {
        return {
          divisions: Math.max(divisionsX, divisionsY), // Backward compatibility
          cellSize: cellSize,
          divisionsX,
          divisionsY
        };
      }
    }
    
    // Fallback: create square grid based on minimum dimension
    const minDimension = Math.min(width, height);
    const cellSize = Math.floor(minDimension / 10); // Create ~10 divisions
    const divisionsX = Math.round(width / cellSize);
    const divisionsY = Math.round(height / cellSize);
    
    return {
      divisions: Math.max(divisionsX, divisionsY),
      cellSize,
      divisionsX,
      divisionsY
    };
  }

  /**
   * Draw the grid system
   */
  private draw(): void {
    if (!this.config.enabled) return;
    
    this.graphics.clear();
    
    // Draw grid first (behind bounds)
    if (this.config.showGrid) {
      this.drawGrid();
    }
    
    // Draw bounds
    if (this.config.showBounds) {
      this.drawBounds();
    }
  }

  /**
   * Draw the square grid lines that perfectly fit the scene size
   */
  private drawGrid(): void {
    this.graphics.lineStyle(1, this.config.gridColor, this.config.gridAlpha);
    
    const divisionsX = this.config.divisionsX;
    const divisionsY = this.config.divisionsY;
    const cellWidth = this.sceneWidth / divisionsX;
    const cellHeight = this.sceneHeight / divisionsY;
    
    let verticalLines = 0;
    let horizontalLines = 0;
    
    // Draw vertical grid lines (perfectly spaced across width)
    for (let i = 1; i < divisionsX; i++) {
      const x = i * cellWidth;
      this.graphics.lineBetween(x, 0, x, this.sceneHeight);
      verticalLines++;
    }
    
    // Draw horizontal grid lines (perfectly spaced across height) 
    for (let i = 1; i < divisionsY; i++) {
      const y = i * cellHeight;
      this.graphics.lineBetween(0, y, this.sceneWidth, y);
      horizontalLines++;
    }
    
    console.log(`🟩 Square grid drawn: ${verticalLines} vertical, ${horizontalLines} horizontal (${divisionsX}x${divisionsY} divisions, cell: ${cellWidth.toFixed(1)}x${cellHeight.toFixed(1)}px)`);
  }

  /**
   * Draw scene boundaries
   */
  private drawBounds(): void {
    // Draw outer boundary
    this.graphics.lineStyle(2, this.config.boundsColor, this.config.boundsAlpha);
    this.graphics.strokeRect(0, 0, this.sceneWidth, this.sceneHeight);
    
    // Draw center cross lines
    this.graphics.lineStyle(1, this.config.boundsColor, this.config.boundsAlpha * 0.5);
    this.graphics.lineBetween(this.sceneWidth / 2, 0, this.sceneWidth / 2, this.sceneHeight); // Vertical center
    this.graphics.lineBetween(0, this.sceneHeight / 2, this.sceneWidth, this.sceneHeight / 2); // Horizontal center
  }

  /**
   * Enable the grid system
   */
  public enable(): void {
    this.config.enabled = true;
    this.draw();
  }

  /**
   * Disable the grid system
   */
  public disable(): void {
    this.config.enabled = false;
    this.graphics.clear();
  }

  /**
   * Toggle grid system visibility
   */
  public toggle(): void {
    if (this.config.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Toggle grid lines visibility
   */
  public toggleGrid(): void {
    this.config.showGrid = !this.config.showGrid;
    this.draw();
  }

  /**
   * Toggle bounds visibility
   */
  public toggleBounds(): void {
    this.config.showBounds = !this.config.showBounds;
    this.draw();
  }

  /**
   * Set grid size (this will calculate divisions based on size)
   */
  public setGridSize(size: number): void {
    const squareGridConfig = this.calculateSquareGridConfig(size, undefined);
    this.config.gridSize = squareGridConfig.cellSize;
    this.config.gridDivisions = squareGridConfig.divisions;
    this.config.divisionsX = squareGridConfig.divisionsX;
    this.config.divisionsY = squareGridConfig.divisionsY;
    if (this.config.enabled) {
      this.draw();
    }
  }

  /**
   * Set grid divisions (this will recalculate grid size)
   */
  public setGridDivisions(divisions: number): void {
    const squareGridConfig = this.calculateSquareGridConfig(undefined, divisions);
    this.config.gridDivisions = squareGridConfig.divisions;
    this.config.gridSize = squareGridConfig.cellSize;
    this.config.divisionsX = squareGridConfig.divisionsX;
    this.config.divisionsY = squareGridConfig.divisionsY;
    if (this.config.enabled) {
      this.draw();
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<GridSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.config.enabled) {
      this.draw();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): ExtendedGridSystemConfig {
    return { ...this.config };
  }

  /**
   * Get graphics object for external access
   */
  public getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.graphics) {
      this.graphics.destroy();
    }
  }
}