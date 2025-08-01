export const textInteractive = {
    title: 'Interactive Text',
    description: 'Text that changes color and scale on hover',
    create: (scene: Phaser.Scene) => {
        const text = scene.add.text(400, 300, 'Hello Phaser!', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);
        text.setInteractive();

        text.on('pointerover', () => {
            text.setColor('#ff0000');
            text.setScale(1.2);
        });

        text.on('pointerout', () => {
            text.setColor('#ffffff');
            text.setScale(1);
        });

        scene.add.text(400, 400, 'Hover over the text above!', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);
    }
};