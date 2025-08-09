import { Meta, Demo } from 'phaser-viewer';
import { SimpleButton } from '@/components/SimpleButton';
import { COLORS } from '@/utils/colors';

const meta = {
  component: SimpleButton,
  title: "UI/SimpleButton",
  description: "A simple interactive button with hover effects and animations"
} as const satisfies Meta<typeof SimpleButton>;

export default meta;

export const Default: Demo<typeof meta, { text: string }> = {
  name: "Default Button",
  args: { text: "Click Me!" },
  create: (scene, args) => new SimpleButton(scene, {
    x: 400,
    y: 300,
    text: args.text
  })
};

export const CustomColors: Demo<typeof meta, { text: string; color: number }> = {
  name: "Custom Colors",
  args: { text: "Warning Button", color: COLORS.warning },
  create: (scene, args) => new SimpleButton(scene, {
    x: 400,
    y: 300,
    text: args.text,
    color: args.color
  })
};

export const InteractiveTest: Demo<typeof meta, { text: string }> = {
  name: "Interactive Test",
  args: { text: "Test Me" },
  create: (scene, args) => {
    const button = new SimpleButton(scene, {
      x: 400,
      y: 300,
      text: args.text,
      width: 250,
      height: 60
    });
    
    button.animateIn();
    return button;
  },
  play: async (scene, component) => {
    const { expect, delay } = await import('phaser-viewer');
    
    // Test button exists
    expect(component).toBeTruthy();
    
    // Test color change
    component.setColor(COLORS.error);
    await delay(500);
    
    // Test text change
    component.setText("Changed!");
    await delay(500);
    
    // Test click simulation
    let clicked = false;
    component.on('click', () => {
      clicked = true;
    });
    
    component.emit('click');
    expect(clicked).toBe(true);
    
    // Reset to original
    component.setColor(COLORS.primary);
    component.setText("Test Me");
  }
};