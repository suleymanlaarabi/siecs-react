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
  render(node: ReactNode): void;
  unmount(): void;
}
