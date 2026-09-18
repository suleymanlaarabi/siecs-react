import type { ReactNode } from "react";
import { createRootContainer } from "./internal/instance.js";
import {
  createRendererRoot,
  unmountRendererRoot,
  updateRendererRoot,
} from "./internal/renderer/reconciler.js";
import type { Root } from "./types.js";

export function createRoot(): Root {
  const container = createRootContainer();
  const rendererRoot = createRendererRoot(container);
  let mounted = true;

  return {
    render(node: ReactNode): void {
      if (!mounted) {
        throw new Error("Cannot render into an unmounted siecs-react root.");
      }
      updateRendererRoot(rendererRoot, node);
    },

    unmount(): void {
      if (!mounted) return;
      mounted = false;
      unmountRendererRoot(rendererRoot);
    },
  };
}
