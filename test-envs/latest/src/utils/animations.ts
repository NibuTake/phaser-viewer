export const ANIMATIONS = {
  fadeIn: (target: Phaser.GameObjects.GameObject, duration = 500) => {
    target.scene.add.tween({
      targets: target,
      alpha: { from: 0, to: 1 },
      duration
    });
  },

  slideIn: (target: Phaser.GameObjects.GameObject, direction: 'left' | 'right' | 'up' | 'down' = 'left', duration = 300) => {
    const scene = target.scene;
    const startOffset = 200;
    
    const startX = target.x;
    const startY = target.y;
    
    switch (direction) {
      case 'left':
        target.x = startX - startOffset;
        break;
      case 'right':
        target.x = startX + startOffset;
        break;
      case 'up':
        target.y = startY - startOffset;
        break;
      case 'down':
        target.y = startY + startOffset;
        break;
    }
    
    scene.add.tween({
      targets: target,
      x: startX,
      y: startY,
      duration,
      ease: 'Back.easeOut'
    });
  }
};