import { COLORS } from '@/utils/colors';
import { ANIMATIONS } from '@/utils/animations';

export interface SimpleButtonConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  color?: number;
  textColor?: string;
  fontSize?: string;
}

export class SimpleButton extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private config: Required<SimpleButtonConfig>;

  constructor(scene: Phaser.Scene, config: SimpleButtonConfig) {
    super(scene, config.x, config.y);
    
    this.config = {
      width: 200,
      height: 50,
      color: COLORS.primary,
      textColor: '#ffffff',
      fontSize: '18px',
      ...config
    };

    this.createButton();
    this.setupInteractivity();
    scene.add.existing(this);
  }

  private createButton() {
    // Background
    this.background = this.scene.add.rectangle(
      0, 0, 
      this.config.width, 
      this.config.height, 
      this.config.color
    );
    this.background.setStrokeStyle(2, 0x666666);

    // Text
    this.text = this.scene.add.text(0, 0, this.config.text, {
      fontSize: this.config.fontSize,
      color: this.config.textColor,
      fontFamily: 'Arial'
    });
    this.text.setOrigin(0.5);

    this.add([this.background, this.text]);
  }

  private setupInteractivity() {
    this.background.setInteractive({ useHandCursor: true });

    this.background.on('pointerover', () => {
      this.background.setFillStyle(COLORS.secondary);
      this.scene.add.tween({
        targets: this,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });

    this.background.on('pointerout', () => {
      this.background.setFillStyle(this.config.color);
      this.scene.add.tween({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });

    this.background.on('pointerdown', () => {
      this.scene.add.tween({
        targets: this,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true
      });
      this.emit('click');
    });
  }

  setText(text: string) {
    this.text.setText(text);
  }

  setColor(color: number) {
    this.config.color = color;
    this.background.setFillStyle(color);
  }

  animateIn() {
    ANIMATIONS.fadeIn(this);
    ANIMATIONS.slideIn(this, 'left');
  }
}