import type { ReactNode } from "react";

export interface EntityProps {
  name?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export interface EntityRef {
  readonly id: bigint;
  isAlive(): boolean;
}

export interface Root {
  /** Commits the React tree and its ECS mutations before returning. */
  render(node: ReactNode): void;
  unmount(): void;
}
