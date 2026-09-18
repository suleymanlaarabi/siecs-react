import type { ReactNode } from "react";
import type { Component, ComponentMutation } from "siecs-ts";
import type { EntityProps, EntityRef } from "../types.js";

export const ENTITY_TYPE = "siecs-entity";
export const COMPONENT_TYPE = "siecs-component";

export type HostType = typeof ENTITY_TYPE | typeof COMPONENT_TYPE;

export interface EntityHostProps extends EntityProps {
  ref?: React.Ref<EntityRef>;
}

export interface ComponentHostProps {
  component: Component<unknown, ComponentMutation>;
  value: unknown;
  children?: ReactNode;
}

export type HostProps = EntityHostProps | ComponentHostProps;

export interface RootContainer {
  children: EntityInstance[];
}

export interface EntityInstance extends EntityRef {
  kind: "entity";
  id: bigint;
  mounted: boolean;
  parent: EntityInstance | RootContainer | null;
  children: HostInstance[];
  props: EntityHostProps;
  hidden: boolean;
}

export interface ComponentInstance {
  kind: "component";
  component: Component<unknown, ComponentMutation>;
  value: unknown;
  parent: EntityInstance | null;
  mounted: boolean;
}

export type HostInstance = EntityInstance | ComponentInstance;
