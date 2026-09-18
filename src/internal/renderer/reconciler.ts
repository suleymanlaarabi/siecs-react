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
