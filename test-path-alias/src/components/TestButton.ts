import { COLORS } from '@/utils/colors';

export class TestButton extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, label: string) {
    super(scene, x, y);

    this.background = scene.add.rectangle(0, 0, 200, 50, COLORS.primary);
    this.background.setInteractive();
    
    this.text = scene.add.text(0, 0, label, {
      fontSize: '20px',
      color: '#ffffff'
    });
    this.text.setOrigin(0.5);

    this.add([this.background, this.text]);
    scene.add.existing(this);
  }

  setColor(color: number) {
    this.background.setFillStyle(color);
  }
}