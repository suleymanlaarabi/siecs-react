import type { ReactNode } from "react";
import ReactReconciler from "react-reconciler";
import { ConcurrentRoot } from "react-reconciler/constants";
import type { RootContainer } from "../host-types.js";
import { hostConfig } from "./host-config.js";

type OpaqueRoot = object;
type ErrorInfo = { componentStack?: string };

interface Reconciler034 {
  createContainer(
    container: RootContainer,
    tag: number,
    hydrationCallbacks: null,
    isStrictMode: boolean,
    concurrentUpdatesByDefaultOverride: null,
    identifierPrefix: string,
    onUncaughtError: (error: Error, info: ErrorInfo) => void,
    onCaughtError: (error: Error, info: ErrorInfo) => void,
    onRecoverableError: (error: Error, info: ErrorInfo) => void,
    onDefaultTransitionIndicator: () => void,
  ): OpaqueRoot;
  updateContainer(
    node: ReactNode,
    root: OpaqueRoot,
    parent: null,
    callback: null,
  ): void;
  updateContainerSync(
    node: ReactNode,
    root: OpaqueRoot,
    parent: null,
    callback: null,
  ): void;
  flushSyncWork(): boolean;
  flushSyncFromReconciler<Result>(callback?: () => Result): Result | undefined;
  batchedUpdates<Result>(callback: () => Result, argument: undefined): Result;
  discreteUpdates<Result>(
    callback: () => Result,
    arg0: undefined,
    arg1: undefined,
    arg2: undefined,
    arg3: undefined,
  ): Result;
  defaultOnUncaughtError(error: Error, info: ErrorInfo): void;
  defaultOnCaughtError(error: Error, info: ErrorInfo): void;
  defaultOnRecoverableError(error: Error, info: ErrorInfo): void;
}

const reconciler = ReactReconciler(hostConfig) as unknown as Reconciler034;

export type RendererRoot = OpaqueRoot;

export function createRendererRoot(container: RootContainer): RendererRoot {
  return reconciler.createContainer(
    container,
    ConcurrentRoot,
    null,
    false,
    null,
    "",
    reconciler.defaultOnUncaughtError,
    reconciler.defaultOnCaughtError,
    reconciler.defaultOnRecoverableError,
    () => {},
  );
}

export function updateRendererRoot(
  root: RendererRoot,
  node: ReactNode,
): void {
  reconciler.updateContainerSync(node, root, null, null);
  reconciler.flushSyncWork();
}

export function unmountRendererRoot(root: RendererRoot): void {
  reconciler.updateContainerSync(null, root, null, null);
  reconciler.flushSyncWork();
}

export function batchedUpdates<Result>(callback: () => Result): Result {
  return reconciler.batchedUpdates(callback, undefined);
}

export function discreteUpdates<Result>(callback: () => Result): Result {
  return reconciler.discreteUpdates(callback, undefined, undefined, undefined, undefined);
}

/**
 * SIECS may invoke JS from its synchronous native run loop. Flush work here,
 * because that loop does not yield to React's host scheduler between frames.
 */
export function flushSyncWork(): void {
  reconciler.flushSyncWork();
}

export function flushSyncFromReconciler<Result>(callback?: () => Result): Result | undefined {
  return reconciler.flushSyncFromReconciler(callback);
}
