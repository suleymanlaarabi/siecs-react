import {
  ContinuousEventPriority,
  DiscreteEventPriority,
  DefaultEventPriority,
  NoEventPriority,
} from "react-reconciler/constants";
import type { SiecsPointerEventType } from "../../types.js";

export { ContinuousEventPriority, DiscreteEventPriority };

let currentPriority = NoEventPriority;
let currentEventType: string | null = null;
let currentEventTimestamp = -1;
let synchronousEventUpdates = 0;

export function setCurrentUpdatePriority(priority: number): void {
  currentPriority = priority;
}

export function getCurrentUpdatePriority(): number {
  return currentPriority;
}

export function resolveUpdatePriority(): number {
  // SDL dispatch enters JS from a blocking native run loop. The update must
  // therefore use a sync lane even for a semantically continuous event;
  // otherwise React's scheduled task cannot run until run() returns.
  if (synchronousEventUpdates !== 0) return DiscreteEventPriority;
  return currentPriority || DefaultEventPriority;
}

export function runWithSynchronousEventUpdates<Result>(callback: () => Result): Result {
  synchronousEventUpdates++;
  try {
    return callback();
  } finally {
    synchronousEventUpdates--;
  }
}

export function runWithEventContext<Result>(
  priority: number,
  type: SiecsPointerEventType,
  timestamp: number,
  callback: () => Result,
): Result {
  const previousPriority = currentPriority;
  const previousType = currentEventType;
  const previousTimestamp = currentEventTimestamp;
  currentPriority = priority;
  currentEventType = type;
  currentEventTimestamp = timestamp;
  try {
    return callback();
  } finally {
    currentPriority = previousPriority;
    currentEventType = previousType;
    currentEventTimestamp = previousTimestamp;
  }
}

export function resolveEventType(): string | null {
  return currentEventType;
}

export function resolveEventTimeStamp(): number {
  return currentEventTimestamp;
}
