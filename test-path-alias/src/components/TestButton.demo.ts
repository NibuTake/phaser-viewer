import { Meta, Demo } from 'phaser-viewer';
import { TestButton } from '@/components/TestButton';
import { COLORS } from '@/utils/colors';

const meta = {
  component: TestButton,
  title: "PathAlias/TestButton",
  description: "Test button with TypeScript path aliases"
} as const satisfies Meta<typeof TestButton>;

export default meta;

export const Default: Demo<typeof meta, { label: string }> = {
  name: "Default Button",
  args: { label: "Click Me" },
  create: (scene, args) => new TestButton(scene, 400, 300, args.label)
};

export const ColorTest: Demo<typeof meta, { label: string }> = {
  name: "Color Test",
  args: { label: "Test Colors" },
  create: (scene, args) => new TestButton(scene, 400, 300, args.label),
  play: async (scene, component) => {
    const { expect, delay } = await import('phaser-viewer');
    
    // Test if button was created with primary color
    expect(component).toBeTruthy();
    
    // Change to secondary color
    component.setColor(COLORS.secondary);
    await delay(500);
    
    // Change to error color
    component.setColor(COLORS.error);
    await delay(500);
    
    // Back to primary
    component.setColor(COLORS.primary);
  }
};