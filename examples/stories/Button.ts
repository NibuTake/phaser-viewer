export class Button extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    config?: {
      color?: number;
      width?: number;
      height?: number;
      fontSize?: string;
      fontColor?: string;
    },
  ) {
    super(scene, x, y);

    const width = config?.width || 200;
    const height = config?.height || 60;

    this.background = scene.add.rectangle(
      0,
      0,
      width,
      height,
      config?.color || 0x4caf50,
    );
    this.text = scene.add
      .text(0, 0, text, {
        fontSize: config?.fontSize || "24px",
        color: config?.fontColor || "#ffffff",
      })
      .setOrigin(0.5);

    this.add([this.background, this.text]);
    this.setSize(width, height);
    this.setInteractive();

    scene.add.existing(this);
  }

  setColor(color: number): void {
    this.background.setFillStyle(color);
  }

  setText(text: string): void {
    this.text.setText(text);
  }

  getText(): string {
    return this.text.text;
  }

  enable(): void {
    this.setAlpha(1);
    this.setInteractive();
  }

  disable(): void {
    this.setAlpha(0.5);
    this.removeInteractive();
  }
}
