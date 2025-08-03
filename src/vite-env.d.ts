/// <reference types="vite/client" />

declare module "*.ts?raw" {
  const content: string;
  export default content;
}

declare module "*.tsx?raw" {
  const content: string;
  export default content;
}

declare global {
  interface Window {
    iconUris?: { [key: string]: string };
    Button?: unknown;
    SampleSprite?: unknown;
    Phaser?: unknown;
    assert?: (condition: boolean, message: string) => void;
    assertEquals?: (
      actual: unknown,
      expected: unknown,
      message: string,
    ) => void;
  }
}
