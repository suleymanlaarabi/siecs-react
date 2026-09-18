import * as siecs from "siecs-ts";
import {
  bind,
  type AnyBoundComponent,
  type BoundComponent,
  type UnwrapComponent,
  unwrapComponent,
} from "./bind.js";

export interface ComponentArray {
  readonly type: ComponentField;
  readonly count: number;
}
export type ComponentField = string | siecs.Component | AnyBoundComponent | ComponentArray;
export type ComponentSchema = Readonly<Record<string, ComponentField>>;
export type ReflectedArray<Type = unknown, Count extends number = number> =
  siecs.ReflectedArray<Type, Count>;

type NormalizedField<Field> = UnwrapComponent<Field> extends siecs.Component
  ? UnwrapComponent<Field>
  : Field extends ComponentArray
    ? siecs.ReflectedArray<NormalizedField<Field["type"]>, Field["count"]>
    : Field;
type NormalizedSchema<Schema extends ComponentSchema> = {
  readonly [Key in keyof Schema]: NormalizedField<Schema[Key]>;
} & siecs.ComponentSchema;
type ComponentInput = siecs.Component<unknown, siecs.ComponentMutation> | AnyBoundComponent;
type WritableComponentInput = siecs.Component<unknown, "direct"> | AnyBoundComponent<"direct">;
type NormalizedComponent<Input> = UnwrapComponent<Input> extends siecs.Component<
  unknown,
  siecs.ComponentMutation
>
  ? UnwrapComponent<Input>
  : never;
type ComponentData<Input> = siecs.ComponentValue<NormalizedComponent<Input>>;

export type AccessTarget = ComponentInput | siecs.Resource;
export type AccessTerm = AccessTarget | siecs.Write | siecs.Filter | siecs.Without;
export type AccessDescriptor = Readonly<Record<string, AccessTerm>>;
type NormalizedTerm<Term> = UnwrapComponent<Term> extends siecs.Component
  ? UnwrapComponent<Term>
  : Term;
type NormalizedDescriptor<Descriptor extends AccessDescriptor> = {
  readonly [Key in keyof Descriptor]: NormalizedTerm<Descriptor[Key]>;
} & siecs.AccessDescriptor;

type TargetOf<Term> = Term extends siecs.Write<infer Target>
  ? Target
  : Term extends siecs.Filter<infer Target>
    ? Target
    : Term extends siecs.Without<infer Target>
      ? Target
      : Term;
type DataOf<Term> = UnwrapComponent<TargetOf<Term>> extends siecs.Component<
  infer Data,
  siecs.ComponentMutation
>
  ? Data
  : TargetOf<Term> extends siecs.Resource<infer Data>
    ? Data
    : never;
type IsComponent<Term> = UnwrapComponent<TargetOf<Term>> extends siecs.Component
  ? true
  : false;
type IsHidden<Term> = Term extends siecs.Filter | siecs.Without ? true : false;
type ComponentKeys<Descriptor extends AccessDescriptor> = {
  [Key in keyof Descriptor]: IsComponent<Descriptor[Key]> extends true ? Key : never;
}[keyof Descriptor];
type EntityField<Descriptor extends AccessDescriptor> = [ComponentKeys<Descriptor>] extends [never]
  ? Record<never, never>
  : { readonly entity: EntityHandle };
type DataFields<Descriptor extends AccessDescriptor> = {
  readonly [Key in keyof Descriptor as IsHidden<Descriptor[Key]> extends true
    ? never
    : Key]: Descriptor[Key] extends siecs.Write
    ? DataOf<Descriptor[Key]>
    : siecs.DeepReadonly<DataOf<Descriptor[Key]>>;
};
export type AccessRow<Descriptor extends AccessDescriptor> = EntityField<Descriptor> &
  DataFields<Descriptor>;
export type ObserverRow<Descriptor extends AccessDescriptor> = {
  readonly entity: EntityHandle;
} & DataFields<Descriptor>;

function normalizeField(field: ComponentField): siecs.ComponentField {
  if (typeof field === "function") return unwrapComponent(field);
  if (typeof field === "object" && field !== null && "count" in field) {
    return siecs.array(normalizeField(field.type as ComponentField), field.count);
  }
  return field as siecs.ComponentField;
}

function normalizeSchema<Schema extends ComponentSchema>(schema: Schema): NormalizedSchema<Schema> {
  return Object.fromEntries(
    Object.entries(schema).map(([name, field]) => [name, normalizeField(field)]),
  ) as NormalizedSchema<Schema>;
}

function normalizeTerm(term: AccessTerm): unknown {
  if (typeof term === "object" && term !== null && "access" in term) {
    return { ...term, target: unwrapComponent(term.target as ComponentInput) };
  }
  return unwrapComponent(term as ComponentInput);
}

function normalizeDescriptor<Descriptor extends AccessDescriptor>(
  descriptor: Descriptor,
): NormalizedDescriptor<Descriptor> {
  return Object.fromEntries(
    Object.entries(descriptor).map(([name, term]) => [name, normalizeTerm(term)]),
  ) as NormalizedDescriptor<Descriptor>;
}

function entityId(entity: EntityHandle | siecs.Entity | bigint): bigint {
  return typeof entity === "bigint" ? entity : entity.entity;
}

function wrapRow<Row extends { entity?: siecs.Entity }>(row: Row): void {
  if ("entity" in row && row.entity instanceof siecs.Entity) {
    (row as unknown as { entity: EntityHandle }).entity = new EntityHandle(row.entity);
  }
}

export class EntityHandle {
  constructor(private readonly source: siecs.Entity) {}

  get entity(): bigint {
    return this.source.entity;
  }

  add(...components: ComponentInput[]): this {
    for (const component of components) this.source.add(unwrapComponent(component));
    return this;
  }

  has(component: ComponentInput): boolean {
    return this.source.has(unwrapComponent(component));
  }

  remove(...components: ComponentInput[]): this {
    for (const component of components) this.source.remove(unwrapComponent(component));
    return this;
  }

  kill(): void { this.source.kill(); }
  isAlive(): boolean { return this.source.isAlive(); }

  relate(relation: siecs.Relation, target: EntityHandle | siecs.Entity | bigint): this {
    this.source.relate(relation, entityId(target));
    return this;
  }

  unrelate(relation: siecs.Relation): this {
    this.source.unrelate(relation);
    return this;
  }

  target(relation: siecs.Relation): bigint { return this.source.target(relation); }
  hasRelation(relation: siecs.Relation): boolean { return this.source.hasRelation(relation); }

  setName(value: string): this {
    this.source.setName(value);
    return this;
  }

  getName(): string { return this.source.getName(); }

  set<ComponentType extends ComponentInput>(
    component: ComponentType,
    value: ComponentData<ComponentType>,
  ): this {
    this.source.set(unwrapComponent(component), value as never);
    return this;
  }
}

export function array<const Type extends ComponentField, const Count extends number>(
  type: Type,
  count: Count,
): siecs.ReflectedArray<NormalizedField<Type>, Count> {
  return siecs.array(normalizeField(type), count) as siecs.ReflectedArray<NormalizedField<Type>, Count>;
}

export function component(name: string): BoundComponent<siecs.Component<Record<never, never>, "direct">>;
export function component<const Schema extends ComponentSchema>(
  name: string,
  schema: Schema,
): BoundComponent<siecs.Component<siecs.ComponentData<NormalizedSchema<Schema>>, "direct">>;
export function component(
  name: string,
  schema?: ComponentSchema,
): BoundComponent<siecs.Component<any, "direct">> {
  const source: siecs.Component<unknown, "direct"> =
    schema === undefined
      ? siecs.component(name)
      : siecs.component(name, normalizeSchema(schema) as siecs.ComponentSchema);
  return bind(source) as BoundComponent<siecs.Component<any, "direct">>;
}

export function resource<const Schema extends ComponentSchema>(
  name: string,
  schema: Schema,
  initial: siecs.ComponentData<NormalizedSchema<Schema>>,
): siecs.Resource<siecs.ComponentData<NormalizedSchema<Schema>>> {
  return siecs.resource(name, normalizeSchema(schema), initial) as siecs.Resource<
    siecs.ComponentData<NormalizedSchema<Schema>>
  >;
}

export function write<const Target extends WritableComponentInput | siecs.Resource>(
  target: Target,
): siecs.Write<UnwrapComponent<Target> extends siecs.AccessTarget ? UnwrapComponent<Target> : never> {
  return siecs.write(unwrapComponent(target as ComponentInput) as never);
}

export function filter<const ComponentType extends ComponentInput>(target: ComponentType): siecs.Filter<NormalizedComponent<ComponentType>> {
  return siecs.filter(unwrapComponent(target)) as siecs.Filter<NormalizedComponent<ComponentType>>;
}

export function without<const ComponentType extends ComponentInput>(target: ComponentType): siecs.Without<NormalizedComponent<ComponentType>> {
  return siecs.without(unwrapComponent(target)) as siecs.Without<NormalizedComponent<ComponentType>>;
}

export function add(entity: EntityHandle | siecs.Entity | bigint, ...components: ComponentInput[]): void {
  for (const component of components) siecs.add(entityId(entity), unwrapComponent(component));
}

export function has(entity: EntityHandle | siecs.Entity | bigint, component: ComponentInput): boolean {
  return siecs.has(entityId(entity), unwrapComponent(component));
}

export function remove(entity: EntityHandle | siecs.Entity | bigint, ...components: ComponentInput[]): void {
  for (const component of components) siecs.remove(entityId(entity), unwrapComponent(component));
}

export function set<ComponentType extends ComponentInput>(
  entity: EntityHandle | siecs.Entity | bigint,
  component: ComponentType,
  value: ComponentData<ComponentType>,
): void {
  siecs.set(entityId(entity), unwrapComponent(component), value as never);
}

export function entity(...components: ComponentInput[]): EntityHandle {
  const value = siecs.entity();
  for (const component of components) value.add(unwrapComponent(component));
  return new EntityHandle(value);
}

export function query<const Descriptor extends AccessDescriptor>(
  descriptor: Descriptor & { readonly entity?: never },
): { each(callback: (row: AccessRow<Descriptor>) => void): void; map<Result>(callback: (row: AccessRow<Descriptor>) => Result): Result[] } {
  const source = siecs.query(normalizeDescriptor(descriptor) as siecs.AccessDescriptor);
  return {
    each(callback) {
      source.each((row) => {
        wrapRow(row);
        callback(row as AccessRow<Descriptor>);
      });
    },
    map(callback) {
      return source.map((row) => {
        wrapRow(row);
        return callback(row as AccessRow<Descriptor>);
      });
    },
  };
}

export function system<const Descriptor extends AccessDescriptor>({
  name,
  query: descriptor = {} as Descriptor,
  each,
  options,
}: {
  name?: string;
  query?: Descriptor & { readonly entity?: never };
  each: (row: AccessRow<Descriptor>, context: siecs.SystemContext) => void;
  options?: siecs.SystemOptions;
}): siecs.System {
  return siecs.system({
    name,
    query: normalizeDescriptor(descriptor) as siecs.AccessDescriptor,
    each: (row, context) => {
      wrapRow(row);
      each(row as AccessRow<Descriptor>, context);
    },
    options,
  });
}

export function observer<EventType extends siecs.Event<unknown>, Descriptor extends AccessDescriptor>(
  observedEvent: EventType,
  descriptor: Descriptor & { readonly entity?: never },
  callback: (
    row: ObserverRow<Descriptor>,
    payload: EventType extends siecs.Event<infer Payload> ? Payload : never,
  ) => void,
): siecs.Observer {
  return siecs.observer(
    observedEvent,
    normalizeDescriptor(descriptor) as siecs.AccessDescriptor,
    (row, payload) => {
      wrapRow(row);
      callback(row as unknown as ObserverRow<Descriptor>, payload as never);
    },
  );
}

export const createEntity = siecs.createEntity;
export function isAlive(entity: EntityHandle | siecs.Entity | bigint): boolean {
  return siecs.isAlive(entityId(entity));
}
export function kill(entity: EntityHandle | siecs.Entity | bigint): void {
  siecs.kill(entityId(entity));
}
export const defer = siecs.defer;
export const deferBegin = siecs.deferBegin;
export const deferEnd = siecs.deferEnd;
export function relate(
  entity: EntityHandle | siecs.Entity | bigint,
  relation: siecs.Relation,
  targetEntity: EntityHandle | siecs.Entity | bigint,
): void {
  siecs.relate(entityId(entity), relation, entityId(targetEntity));
}
export function unrelate(entity: EntityHandle | siecs.Entity | bigint, relation: siecs.Relation): void {
  siecs.unrelate(entityId(entity), relation);
}
export function target(entity: EntityHandle | siecs.Entity | bigint, relation: siecs.Relation): bigint {
  return siecs.target(entityId(entity), relation);
}
export function hasRelation(entity: EntityHandle | siecs.Entity | bigint, relation: siecs.Relation): boolean {
  return siecs.hasRelation(entityId(entity), relation);
}
export function getName(entity: EntityHandle | siecs.Entity | bigint): string {
  return siecs.getName(entityId(entity));
}
export function setName(entity: EntityHandle | siecs.Entity | bigint, value: string): void {
  siecs.setName(entityId(entity), value);
}
export const getResource = siecs.getResource;
export const setResource = siecs.setResource;
export const run = siecs.run;
export const fini = siecs.fini;
export const quit = siecs.quit;
export const progress = siecs.progress;
export const runSystem = siecs.runSystem;
export const runPhase = siecs.runPhase;
export const phase = siecs.phase;
export const enableSystem = siecs.enableSystem;
export const disableSystem = siecs.disableSystem;
export const event = siecs.event;
export function emit<EventType extends siecs.Event<unknown>>(
  entity: EntityHandle | siecs.Entity | bigint,
  emittedEvent: EventType,
  ...args: EventType extends siecs.Event<infer Payload>
    ? Payload extends void
      ? []
      : [Payload]
    : never
): void {
  siecs.emit(entityId(entity), emittedEvent, ...(args as never));
}
export const enableObserver = siecs.enableObserver;
export const disableObserver = siecs.disableObserver;

export const ChildOf = siecs.ChildOf;
export const IsA = siecs.IsA;
export const WindowConfig = siecs.WindowConfig;
export const Sky = siecs.Sky;
export const Sun = siecs.Sun;
export const AmbientLight = siecs.AmbientLight;
export const Fog = siecs.Fog;
export const Shadows = siecs.Shadows;
export const Multisampling = siecs.Multisampling;
export const BloomSettings = siecs.BloomSettings;
export const Keyboard = siecs.Keyboard;
export const Key = siecs.Key;
export const OnAdd = siecs.OnAdd;
export const OnRemove = siecs.OnRemove;
export const OnSet = siecs.OnSet;
export const OnRelationSet = siecs.OnRelationSet;
export const OnRelationRemove = siecs.OnRelationRemove;
export const PreStart = siecs.PreStart;
export const Start = siecs.Start;
export const PostStart = siecs.PostStart;
export const OnLoad = siecs.OnLoad;
export const PostLoad = siecs.PostLoad;
export const PreUpdate = siecs.PreUpdate;
export const OnUpdate = siecs.OnUpdate;
export const PostUpdate = siecs.PostUpdate;
export const PreRender = siecs.PreRender;
export const OnRender = siecs.OnRender;
export const PostRender = siecs.PostRender;

export type {
  ComponentData,
  ComponentMutation,
  ComponentValue,
  DeepReadonly,
  Event,
  FixedArray,
  Phase,
  PhaseOptions,
  Relation,
  RelationEvent,
  Resource,
  ResourceValue,
  SireflectTypes,
  System,
  SystemContext,
  SystemOptions,
} from "siecs-ts";
