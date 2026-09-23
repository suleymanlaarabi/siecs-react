import type { ReactNode } from "react";
import type { PointerType } from "siecs-ts";

export type SiecsPointerEventType =
  | "pointerenter"
  | "pointerleave"
  | "pointermove"
  | "pointerdown"
  | "pointerup"
  | "pointercancel"
  | "click"
  | "press"
  | "wheel";

/** A renderer event snapshot; it is not a DOM PointerEvent. */
export interface SiecsPointerEvent {
  readonly type: SiecsPointerEventType;
  readonly target: EntityRef;
  readonly currentTarget: EntityRef;
  readonly relatedTarget: EntityRef | null;
  readonly pointerId: number;
  readonly pointerType: PointerType;
  readonly button: number;
  readonly buttons: number;
  readonly clicks: number;
  readonly timeStamp: number;
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly wheelX: number;
  readonly wheelY: number;
  readonly rayOriginX: number;
  readonly rayOriginY: number;
  readonly rayOriginZ: number;
  readonly rayDirectionX: number;
  readonly rayDirectionY: number;
  readonly rayDirectionZ: number;
  readonly pointX: number;
  readonly pointY: number;
  readonly pointZ: number;
  readonly normalX: number;
  readonly normalY: number;
  readonly normalZ: number;
  readonly distance: number;
  stopPropagation(): void;
  isPropagationStopped(): boolean;
}

export type PointerEventHandler = (event: SiecsPointerEvent) => void;

export interface PointerEventHandlers {
  onPointerEnter?: PointerEventHandler;
  onPointerLeave?: PointerEventHandler;
  onPointerMove?: PointerEventHandler;
  onPointerDown?: PointerEventHandler;
  onPointerUp?: PointerEventHandler;
  onPointerCancel?: PointerEventHandler;
  onClick?: PointerEventHandler;
  onPress?: PointerEventHandler;
  onWheel?: PointerEventHandler;
}

export interface EntityProps extends PointerEventHandlers {
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
