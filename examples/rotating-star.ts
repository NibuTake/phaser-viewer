export const rotatingStar = {
    title: 'Rotating Star',
    description: 'A yellow star shape that rotates continuously',
    create: (scene: Phaser.Scene) => {
        const graphics = scene.add.graphics();
        graphics.fillStyle(0xffff00, 1);

        // Draw a star
        const centerX = 400;
        const centerY = 300;
        const points = 5;
        const outerRadius = 100;
        const innerRadius = 50;

        const starPoints = [];
        for (let i = 0; i < points * 2; i++) {
            const angle = (Math.PI * 2) / (points * 2) * i - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            starPoints.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius
            });
        }

        graphics.fillPoints(starPoints, true);

        // Add rotation animation
        scene.tweens.add({
            targets: graphics,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1
        });

        scene.add.text(400, 450, 'Rotating Star', {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
    }
};