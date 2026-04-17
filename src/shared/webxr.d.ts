declare module "three/examples/jsm/webxr/ARButton.js" {
  import { WebGLRenderer } from "three";

  export class ARButton {
    static createButton(
      renderer: WebGLRenderer,
      sessionInit?: XRSessionInit
    ): HTMLButtonElement;
  }
}

declare global {
  interface Navigator {
    xr?: XRSystem;
  }
}

export {};
