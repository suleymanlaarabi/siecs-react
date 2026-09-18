import { createElement, type ComponentType } from "react";
import type { Component, ComponentValue } from "siecs-ts";
import * as siecs from "siecs-ts";
import { COMPONENT_TYPE } from "./internal/host-types.js";

const bindings = new Map<number, ComponentType<unknown>>();
const sourceComponent = Symbol("siecs-react.component");

export type BoundComponent<ComponentTypeValue extends Component = Component> =
  ComponentType<ComponentValue<ComponentTypeValue>> & {
    readonly [sourceComponent]: ComponentTypeValue;
  };

export type AnyBoundComponent<Mutation extends Component["__mutation"] = Component["__mutation"]> = ComponentType<any> & {
  readonly [sourceComponent]: Component<any, NonNullable<Mutation>>;
};

export type ComponentLike<ComponentTypeValue extends Component = Component> =
  | ComponentTypeValue
  | BoundComponent<ComponentTypeValue>;

export type UnwrapComponent<Value> =
  Value extends { readonly [sourceComponent]: infer ComponentTypeValue extends Component }
    ? ComponentTypeValue
    : Value;

export function bind<ComponentTypeValue extends Component>(
  component: ComponentTypeValue,
): BoundComponent<ComponentTypeValue> {
  const cached = bindings.get(component);
  if (cached) {
    return cached as BoundComponent<ComponentTypeValue>;
  }

  function BoundComponent(props: ComponentValue<ComponentTypeValue>) {
    return createElement(COMPONENT_TYPE, { component, value: props });
  }

  BoundComponent.displayName = "SiecsComponent";
  Object.defineProperty(BoundComponent, sourceComponent, { value: component });
  bindings.set(component, BoundComponent as ComponentType<unknown>);
  return BoundComponent as BoundComponent<ComponentTypeValue>;
}

export function unwrapComponent<ComponentTypeValue extends Component>(
  component: ComponentLike<ComponentTypeValue>,
): ComponentTypeValue {
  if (typeof component === "function" && sourceComponent in component) {
    return (component as BoundComponent<ComponentTypeValue>)[sourceComponent];
  }
  return component as ComponentTypeValue;
}

export const Position2d = bind(siecs.Position2d);
export const Velocity2d = bind(siecs.Velocity2d);
export const GlobalPosition2d = bind(siecs.GlobalPosition2d);
export const Scale2d = bind(siecs.Scale2d);
export const GlobalScale2d = bind(siecs.GlobalScale2d);
export const Rotation2d = bind(siecs.Rotation2d);
export const GlobalRotation2d = bind(siecs.GlobalRotation2d);
export const Position3d = bind(siecs.Position3d);
export const Velocity3d = bind(siecs.Velocity3d);
export const GlobalPosition3d = bind(siecs.GlobalPosition3d);
export const Rotation3d = bind(siecs.Rotation3d);
export const GlobalOrientation3d = bind(siecs.GlobalOrientation3d);
export const Scale3d = bind(siecs.Scale3d);
export const GlobalScale3d = bind(siecs.GlobalScale3d);
export const Camera = bind(siecs.Camera);
export const Color = bind(siecs.Color);
export const Cuboid = bind(siecs.Cuboid);
export const Static = bind(siecs.Static);
export const Bloom = bind(siecs.Bloom);
export const Name = bind(siecs.Name);
export const Disabled = bind(siecs.Disabled);
export const Abstract = bind(siecs.Abstract);
