export const card = {
    title: 'Game Card',
    description: 'A card with border, title, and animated rotation',
    create: (scene: Phaser.Scene) => {
        const cardGroup = scene.add.group();

        // Card background
        const bg = scene.add.rectangle(400, 300, 150, 200, 0xffffff);
        bg.setStrokeStyle(3, 0x000000);

        // Card title
        const title = scene.add.text(400, 250, 'Card', {
            fontSize: '20px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Card value
        const value = scene.add.text(400, 350, '10', {
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);

        cardGroup.add([bg, title, value]);

        // Add rotation animation
        scene.tweens.add({
            targets: cardGroup.getChildren(),
            angle: 5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
};