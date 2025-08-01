export const basicSprite = {
    title: 'Basic Red Rectangle',
    description: 'A simple red rectangle GameObject',
    create: (scene: Phaser.Scene) => {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(300, 200, 200, 200);

        scene.add.text(400, 100, 'Basic Red Rectangle', { 
            fontSize: '24px', 
            color: '#ffffff' 
        }).setOrigin(0.5);
    }
};