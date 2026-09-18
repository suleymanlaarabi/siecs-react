# Native React scene

This is a Bun application, not a browser/Vite application. React reconciles
the JSX scene into SIECS entities; `siecs-ts` owns the SDL3/Vulkan window and
the native game loop.

It renders a lit floor and a blue cuboid. Use `W` / `S` / `A` / `D` to move
the cuboid and the left/right arrow keys to rotate it. Close the native window
to exit.

## Run from this checkout

Install the repository dependencies, then start the example:

```sh
cd ../siecs-react && bun install
bun run example:native-react
```

The app requires Bun 1.4.2+, Linux x64, SDL3, Vulkan, and a graphical desktop
session. Do not run it through Vite or open it in a browser.

The start command rebuilds `../siecs-ts` first, keeping the Bun bindings, the
native library, and the compiled shaders in sync.

The TypeScript paths point to the current `siecs-react` source while sharing
its single `siecs-ts` runtime with the renderer.

The application imports both JSX components and ECS operations from
`siecs-react`; each component keeps the same name in the scene and systems.

Press `Q` to quit from the scene (the native renderer also accepts `Escape` or
the window close action). `root.render()` commits the ECS scene before it
returns, so the application can enter `run()` directly without refs, timers,
or teardown orchestration.
