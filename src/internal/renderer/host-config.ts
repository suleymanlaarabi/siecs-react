import { createContext } from "react";
import type Reconciler from "react-reconciler";
import { deferBegin, deferEnd } from "siecs-ts";
import {
  appendChild,
  appendChildToContainer,
  appendInitialChild,
  clearContainer,
  insertBefore,
  insertInContainerBefore,
  removeChild,
  removeChildFromContainer,
} from "../children.js";
import {
  COMPONENT_TYPE,
  ENTITY_TYPE,
  type ComponentHostProps,
  type EntityHostProps,
  type HostInstance,
  type HostProps,
  type HostType,
  type RootContainer,
} from "../host-types.js";
import {
  createComponentInstance,
  createEntityInstance,
} from "../instance.js";
import {
  hideHostInstance,
  unhideHostInstance,
  updateComponent,
  updateEntity,
} from "../update.js";
import { TEXT_NODE_ERROR } from "./constants.js";
import {
  getCurrentUpdatePriority,
  resolveUpdatePriority,
  setCurrentUpdatePriority,
} from "./priorities.js";

type TimeoutHandle = ReturnType<typeof setTimeout>;
type HostContext = Readonly<Record<never, never>>;

const hostContext: HostContext = Object.freeze({});

type Config = Reconciler.HostConfig<
  HostType,
  HostProps,
  RootContainer,
  HostInstance,
  never,
  never,
  never,
  never,
  HostInstance,
  HostContext,
  never,
  TimeoutHandle,
  TimeoutHandle,
  null
>;

interface React034Config {
  maySuspendCommitOnUpdate(
    type: HostType,
    previousProps: HostProps,
    nextProps: HostProps,
  ): boolean;
  maySuspendCommitInSyncRender(type: HostType, props: HostProps): boolean;
  suspendOnActiveViewTransition(state: null, container: RootContainer): void;
  getSuspendedCommitReason(state: null, container: RootContainer): null;
  supportsResources: false;
  supportsSingletons: false;
  supportsTestSelectors: false;
  applyViewTransitionName(instance: HostInstance): void;
  restoreViewTransitionName(instance: HostInstance): void;
  cancelViewTransitionName(instance: HostInstance): void;
  cancelRootViewTransitionName(container: RootContainer): void;
  restoreRootViewTransitionName(container: RootContainer): void;
  bindToConsole(
    method: "error" | "info" | "log" | "warn",
    args: unknown[],
    badgeName: string,
  ): () => void;
}

const transitionContext = createContext<null>(null);

export const hostConfig = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: false,
  warnsIfNotActing: true,

  createInstance(type: HostType, props: HostProps): HostInstance {
    if (type === ENTITY_TYPE) {
      return createEntityInstance(props as EntityHostProps);
    }
    if (type === COMPONENT_TYPE) {
      return createComponentInstance(props as ComponentHostProps);
    }
    throw new Error(`siecs-react does not support the host type ${String(type)}.`);
  },

  createTextInstance(): never {
    throw new Error(TEXT_NODE_ERROR);
  },

  appendInitialChild,
  finalizeInitialChildren: () => false,
  shouldSetTextContent: () => false,
  getRootHostContext: () => hostContext,
  getChildHostContext: () => hostContext,
  getPublicInstance: (instance: HostInstance) => instance,

  prepareForCommit: () => {
    deferBegin();
    return null;
  },
  resetAfterCommit: () => {
    deferEnd();
  },
  preparePortalMount: () => {},

  appendChild,
  appendChildToContainer,
  insertBefore,
  insertInContainerBefore,
  removeChild,
  removeChildFromContainer,
  clearContainer,

  commitUpdate(
    instance: HostInstance,
    _type: HostType,
    _previousProps: HostProps,
    nextProps: HostProps,
  ): void {
    if (instance.kind === "entity") {
      updateEntity(instance, nextProps as EntityHostProps);
    } else {
      updateComponent(instance, (nextProps as ComponentHostProps).value);
    }
  },

  hideInstance: hideHostInstance,
  unhideInstance: unhideHostInstance,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1 as unknown as TimeoutHandle,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,

  setCurrentUpdatePriority,
  getCurrentUpdatePriority,
  resolveUpdatePriority,
  requestPostPaintCallback(callback: (time: number) => void): void {
    setTimeout(() => callback(performance.now()), 0);
  },
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1,
  trackSchedulerEvent: () => {},
  shouldAttemptEagerTransition: () => false,

  maySuspendCommit: () => false,
  maySuspendCommitOnUpdate: () => false,
  maySuspendCommitInSyncRender: () => false,
  preloadInstance: () => true,
  startSuspendingCommit: () => null,
  suspendInstance: () => {},
  suspendOnActiveViewTransition: () => {},
  waitForCommitToBeReady: () => null,
  getSuspendedCommitReason: () => null,
  bindToConsole: (method, args) => () => console[method](...args),

  NotPendingTransition: null,
  HostTransitionContext: transitionContext as never,
  resetFormInstance: () => {},

  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur: () => {},
  afterActiveInstanceBlur: () => {},
  prepareScopeUpdate: () => {},
  getInstanceFromScope: () => null,
  detachDeletedInstance: () => {},

  supportsResources: false,
  supportsSingletons: false,
  supportsTestSelectors: false,

  applyViewTransitionName: () => {},
  restoreViewTransitionName: () => {},
  cancelViewTransitionName: () => {},
  cancelRootViewTransitionName: () => {},
  restoreRootViewTransitionName: () => {},
} satisfies Config & React034Config;
