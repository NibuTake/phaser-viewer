import { Button } from "./Button";

interface ButtonArgs {
  x: number;
  y: number;
  text: string;
  config: { color: number };
}

// デフォルトエクスポート（メタ情報）
export default {
  component: Button,
  title: "UI/TestButton",
  description: "テスト付きボタンコンポーネント",
  tags: ["ui", "interactive", "test"],
  parameters: {
    scene: {
      width: 800,
      height: 600,
      backgroundColor: "#2d2d2d",
    },
  },
};

// Demo 1: 成功するテスト
export const SuccessTest = {
  name: "Success Test",
  args: {
    x: 400,
    y: 300,
    text: "Success Test",
    config: {
      color: 0x4caf50,
    },
  },
  create: (scene: Phaser.Scene, args: ButtonArgs) => {
    const button = new Button(scene, args.x, args.y, args.text, args.config);
    return button;
  },
  play: (_scene: Phaser.Scene, component: unknown) => {
    // Simple success test - component exists
    window.assert?.(component !== null, "Button should exist");
  },
};

// Demo 2: 失敗するテスト
export const FailTest = {
  name: "Fail Test 2",
  args: {
    x: 200,
    y: 200,
    text: "Fail Test",
    config: {
      color: 0xf44336,
    },
  },
  create: (scene: Phaser.Scene, args: ButtonArgs) => {
    const button = new Button(scene, args.x, args.y, args.text, args.config);
    return button;
  },
  play: () => {
    // 確実に失敗するテスト
    window.assert?.(false, "This assertion always fails");
  },
};

// Demo 3: Asyncクリックテスト
export const ClickTest = {
  name: "Click Test",
  args: {
    x: 400,
    y: 300,
    text: "Before",
    config: {
      color: 0x2196f3,
    },
  },
  create: (scene: Phaser.Scene, args: unknown) => {
    console.log("ClickTest create function called with args:", args);
    const button = new Button(scene, args.x, args.y, args.text, args.config);
    console.log("ClickTest button created:", button);
    console.log("ClickTest button has getText?", typeof button.getText);

    // クリック時にテキストを変更
    button.on("pointerdown", () => {
      button.setText("After");
    });

    return button;
  },
  play: async (_scene: Phaser.Scene, component: Record<string, unknown>) => {
    // Verify initial state
    window.assert(component !== null, "Component should exist");
    window.assertEquals(
      component.getText(),
      "Before",
      'Initial text should be "Before"',
    );

    // Simulate click
    component.emit("pointerdown");

    // Wait a bit for the click handler to execute
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify text changed to "After"
    window.assertEquals(
      component.getText(),
      "After",
      'Text should change to "After" after click',
    );
  },
};
