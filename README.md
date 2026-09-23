# siecs-react

A concurrent-safe React renderer and ECS façade for
[siecs-ts](https://www.npmjs.com/package/siecs-ts). React builds an inert JS
tree during render; ECS entities are created and updated only during commit,
inside one deferred SIECS transaction.

```tsx
import { component, createRoot, Entity, system, write } from "siecs-react";

const Position = component("Position", { x: "f32", y: "f32" });

const root = createRoot();
root.render(
  <Entity name="Player">
    <Position x={0} y={0} />
  </Entity>,
);

system({
  query: { position: write(Position) },
  each: ({ position }) => position.x += 1,
});

root.unmount();
```

`Entity` accepts `name`, `disabled`, children, and native pointer handlers.
Nested entities are linked through `ChildOf`. Components imported or created from `siecs-react`
have one name: use `Position3d` in JSX, `write(Position3d)`, `query`,
`system`, `entity().set`, and `row.entity.set`. Native renderer components
such as `Color`, `Cuboid`, and `Camera` are exported in the same way.

`bind(rawComponent)` remains available when adopting a component created by a
direct `siecs-ts` integration. `EntityHandle` is the imperative ECS handle;
`Entity` remains the JSX component.

Use an `EntityRef` to access the entity after commit:

```tsx
import { createRef } from "react";
import { createRoot, Entity, type EntityRef } from "siecs-react";

const player = createRef<EntityRef>();
const root = createRoot();
root.render(<Entity ref={player} />);

player.current?.id;
player.current?.isAlive();
```

Suspense/Offscreen visibility maps to the SIECS `Disabled` component. Text
nodes are intentionally unsupported.

## Pointer interaction

Interaction belongs to the entity, not to a data component. SIECS does the
SDL input, 3D ray and Cuboid picking; React receives the resulting native
event and handles propagation through the committed entity tree.

```tsx
<Entity
  name="Cube"
  onPointerEnter={() => setHovered(true)}
  onPointerLeave={() => setHovered(false)}
  onClick={(event) => {
    console.log(event.pointX, event.pointY, event.pointZ);
  }}
  onPress={(event) => event.stopPropagation()}
>
  <Position3d x={0} y={0} z={0} />
  <Cuboid width={1} height={1} depth={1} />
</Entity>
```

`onPointerEnter` and `onPointerLeave` target only the hit entity. The other
handlers (`onPointerMove`, `onPointerDown`, `onPointerUp`,
`onPointerCancel`, `onClick`, `onPress`, and `onWheel`) bubble through parent
`Entity`s. `event.target` is stable, `event.currentTarget` follows the current
handler, and `stopPropagation()` stops that React-side bubbling.

The renderer adds SIECS `PointerEvents` bits only for entities with handlers.
Replacing a callback without adding or removing an event kind does not mutate
the ECS. The native `Click` and `Press` events remain distinct: applications
can also use `observer(Click, { interactive: filter(PointerEvents) }, ...)`
directly when they need ECS-level handling.

For a complete SDL3/Vulkan scene driven by React JSX (with no browser or
Vite), see [`examples/native-react`](./examples/native-react/README.md).
