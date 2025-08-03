import { Button } from "../Button";

// デフォルトエクスポート（メタ情報）
export default {
  component: Button,
  title: "UI/Button",
  description: "インタラクティブなボタンコンポーネント",
  tags: ["ui", "interactive"],
  parameters: {
    scene: {
      width: 800,
      height: 600,
      backgroundColor: "#2d2d2d",
    },
  },
};

// Demo 1: デフォルトボタン
export const Default = {
  name: "Default Button",
  args: {
    x: 400,
    y: 300,
    text: "Click Me!",
    config: {
      color: 0x4caf50,
    },
  },
  create: (scene: Phaser.Scene, args: unknown) => {
    console.log("Default button create called with args:", args);
    // Use fallback values if args is undefined
    const buttonArgs = args || {
      x: 400,
      y: 300,
      text: "Click Me!",
      config: { color: 0x4caf50 },
    };
    const button = new Button(
      scene,
      buttonArgs.x,
      buttonArgs.y,
      buttonArgs.text,
      buttonArgs.config,
    );

    button.on("pointerdown", () => {
      // Button clicked!
    });

    return button;
  },
};

// Demo 2: ホバーエフェクト付き
export const WithHover = {
  name: "Hover Effect",
  args: {
    x: 400,
    y: 300,
    text: "Hover Me!",
    config: {
      color: 0x2196f3,
    },
  },
  create: (scene: Phaser.Scene, args: unknown) => {
    console.log("WithHover button create called with args:", args);
    // Use fallback values if args is undefined
    const buttonArgs = args || {
      x: 400,
      y: 300,
      text: "Hover Me!",
      config: { color: 0x2196f3 },
    };
    const button = new Button(
      scene,
      buttonArgs.x,
      buttonArgs.y,
      buttonArgs.text,
      buttonArgs.config,
    );

    button.on("pointerover", () => {
      button.setColor(0x1976d2);
      button.setScale(1.05);
    });

    button.on("pointerout", () => {
      button.setColor(buttonArgs.config.color);
      button.setScale(1);
    });

    return button;
  },
};

// Demo 3: アニメーション付きボタン
export const WithAnimation = {
  name: "Animation Demo",
  args: {
    x: 400,
    y: 300,
    text: "Animated!",
    config: {
      color: 0xff6b35,
    },
  },
  create: (scene: Phaser.Scene, args: unknown) => {
    console.log("WithAnimation button create called with args:", args);
    // Use fallback values if args is undefined
    const buttonArgs = args || {
      x: 400,
      y: 300,
      text: "Animated!",
      config: { color: 0xff6b35 },
    };
    const button = new Button(
      scene,
      buttonArgs.x,
      buttonArgs.y,
      buttonArgs.text,
      buttonArgs.config,
    );

    button.on("pointerdown", () => {
      // Animated button clicked!
    });

    return button;
  },
  play: (scene: Phaser.Scene, component: Record<string, unknown>) => {
    // 1秒後にボタンを少し拡大
    scene.time.delayedCall(1000, () => {
      scene.tweens.add({
        targets: component,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        ease: "Back.easeOut",
        yoyo: true,
      });
    });

    // 3秒後に色を変える
    scene.time.delayedCall(3000, () => {
      component.setColor(0x9b59b6);

      // パルスアニメーション
      scene.tweens.add({
        targets: component,
        alpha: 0.5,
        duration: 300,
        yoyo: true,
        repeat: 2,
      });
    });

    // 5秒後にテキストを変更
    scene.time.delayedCall(5000, () => {
      component.setText("Complete!");

      // 回転アニメーション
      scene.tweens.add({
        targets: component,
        rotation: Math.PI * 2,
        duration: 1000,
        ease: "Power2.easeInOut",
      });
    });
  },
};
