export const animatedCircle = {
    title: 'Animated Blue Circle',
    description: 'This creates a bouncing blue circle',
    create: (scene: Phaser.Scene) => {
        const circle = scene.add.graphics();
        circle.fillStyle(0x0088ff, 1);
        circle.fillCircle(0, 0, 50);
        circle.x = 400;
        circle.y = 300;

        // Add bouncing animation
        scene.tweens.add({
            targets: circle,
            y: 150,
            duration: 1000,
            ease: 'Bounce.easeOut',
            yoyo: true,
            repeat: -1
        });

        scene.add.text(400, 500, 'Animated Blue Circle', { 
            fontSize: '20px', 
            color: '#00aaff' 
        }).setOrigin(0.5);
    }
};