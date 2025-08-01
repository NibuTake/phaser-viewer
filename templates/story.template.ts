// Story Template
// Copy this template when creating new stories

// @ts-nocheck
// The 'this' context is a Phaser.Scene instance

// Example: Create a sprite
const sprite = this.add.sprite(400, 300, 'key');

// Example: Add text
const text = this.add.text(400, 100, 'Hello Phaser!', {
    fontSize: '32px',
    color: '#ffffff'
}).setOrigin(0.5);

// Example: Add animation
this.tweens.add({
    targets: sprite,
    rotation: Math.PI * 2,
    duration: 2000,
    repeat: -1
});

// Example: Make interactive
sprite.setInteractive();
sprite.on('pointerdown', () => {
    console.log('Clicked!');
});