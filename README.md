# @hn-studios/script
## Roblox TypeScript Script Package

[![GitHub](https://img.shields.io/badge/GitHub-harihar--nautiyal-black?style=flat&logo=github)](https://github.com/harihar-nautiyal)
[![Instagram](https://img.shields.io/badge/Instagram-harihar--nautiyal-E4405F?style=flat&logo=instagram)](https://instagram.com/harihar-nautiyal)
[![NPM](https://img.shields.io/npm/v/@hn-studios/script?style=flat&logo=npm)](https://www.npmjs.com/package/@hn-studios/script)
[![License](https://img.shields.io/npm/l/@hn-studios/script?style=flat)](https://github.com/harihar-nautiyal/script/blob/main/LICENSE)

A TypeScript package for Roblox that allows easy creation and management of different script types (Server Scripts, Local Scripts, and Module Scripts) with a clean, type-safe API.

## Features

-   Create Server Scripts, Local Scripts, and Module Scripts
-   Type-safe script creation and management
-   Automatic context validation (Server/Client)
-   Error handling and lifecycle management
-   Easy script control (Start/Stop/Destroy)
-   Module script support with require functionality

## Important Configuration

1. **Update `tsconfig.json`**
    Add `@hn-studios` to your `typeRoots`:

    ```json
    {
        "compilerOptions": {
            "typeRoots": [
                "node_modules/@rbxts",
                "node_modules/@hn-studios",  // Add this line
                "node_modules/@types"
            ]
        }
    }
    ```

2. **Update `default.project.json`**
    Add the `@hn-studios` scope to your Rojo configuration:

    ```json
    {
        "ReplicatedStorage": {
            "$className": "ReplicatedStorage",
            "rbxts_include": {
                "$path": "include",
                "node_modules": {
                    "$className": "Folder",
                    "@rbxts": {
                        "$path": "node_modules/@rbxts"
                    },
                    "@hn-studios": {           // Add this block
                        "$path": "node_modules/@hn-studios"
                    }
                }
            }
        }
    }
    ```

## Installation

1. Install the package using npm:

    ```bash
    npm install @hn-studios/script
    ```

2. Add it to your Roblox TypeScript project:

    ```typescript
    import { Script } from "@hn-studios/script";
    ```

## Usage

### Basic Script Creation

```typescript
import { Workspace, ServerStorage, ReplicatedStorage, StarterGui, Players } from "@rbxts/services";

// Get references to Roblox services
const serverStorage = ServerStorage;
const replicatedStorage = ReplicatedStorage;
const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");

// Create a basic server script
const serverScript = new Script(() => {
	print("Server script running!");
}, serverStorage, {
	Type: "Script",
	Name: "MyServerScript",
});

// Create a local script
const localScript = new Script(() => {
	print("Client script running!");
}, playerGui, {
	Type: "LocalScript",
	Name: "MyLocalScript",
});

// Create a module script
const moduleScript = new Script(() => {
    const MyModule = {};

	function MyModule.doSomething() {
		print("Module function called!");
	}

	return MyModule;
}, replicatedStorage, {
	Type: "ModuleScript",
	Name: "MyModule",
});
```

### Script Control

```typescript
// Start a script (automatically called unless Disabled: true)
serverScript.Start();

// Stop a script
serverScript.Stop();

// Destroy a script
serverScript.Destroy();

// For ModuleScripts, use Require
const myModule = moduleScript.Require() as { doSomething: () => void };
myModule.doSomething();
```

### Script Options

```typescript
interface ScriptOptions {
    Name?: string;        // Custom name for the script
    Disabled?: boolean;   // Whether to auto-start the script
    Type?: ScriptType;    // "Script" | "LocalScript" | "ModuleScript"
    RunContext?: "Server" | "Client" | "Both"; // No longer required (inferred from type)
}
```

## API Reference

### Script Class

#### Constructor

```typescript
constructor(callback: () => void, parent?: Instance, options?: ScriptOptions)
```

#### Methods

-   `SetParent(parent: Instance)`: Sets the parent of the script instance.
-   `RemoveParent()`: Removes the parent of the script instance (sets it to nil).
-   `GetName()`: Gets the script's name.
-   `SetName(value: string)`: Sets the script's name.
-   `GetParent()`: Gets the script's parent instance.
-   `GetInstance()`: Gets the underlying Roblox instance.
-   `GetScriptType()`: Gets the script type.
-   `Start()`: Starts script execution.
-   `Stop()`: Stops script execution.
-   `Destroy()`: Cleans up the script and destroys the instance.
-   `Require()`: Requires a module script (ModuleScript only). Returns the module's exported content.

## Example Use Cases

### Server-Side Logic

```typescript
import { Script } from "@hn-studios/script";
import { Players, ServerScriptService } from "@rbxts/services";

const serverScript = new Script(() => {
	Players.PlayerAdded.Connect((player) => {
		print(`${player.Name} joined the game!`);
	});
}, ServerScriptService, {
	Type: "Script",
	Name: "PlayerManager",
});

serverScript.Start(); // Example of how to start a script
```

### Client-Side UI

```typescript
import { Script } from "@hn-studios/script";
import { StarterGui, Players } from "@rbxts/services";

const LocalPlayer = Players.LocalPlayer;
const playerGui = LocalPlayer.WaitForChild("PlayerGui");

const uiScript = new Script(() => {
	// Handle UI updates, assuming a button is created and parented elsewhere
	const button = new Instance("TextButton");
	button.Text = "Click Me!";
	button.Size = new UDim2(0.5, 0, 0.2, 0);
	button.Position = new UDim2(0.25, 0, 0.4, 0);
	button.Parent = playerGui; // You should replace this with the actual ScreenGui

	button.MouseButton1Click.Connect(() => {
		print("Button clicked!");
	});
}, playerGui, {
	Type: "LocalScript",
	Name: "UIHandler",
});

uiScript.Start(); // Start the UI handling
```

### Shared Module

```typescript
import { Script } from "@hn-studios/script";
import { ReplicatedStorage } from "@rbxts/services";

const utilityModule = new Script(() => {
	const UtilityModule = {};

	function UtilityModule.formatTime(seconds: number) {
		const minutes = math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
	}

	return UtilityModule;
}, ReplicatedStorage, {
	Type: "ModuleScript",
	Name: "UtilityModule",
});

// Example of how to use the module
const utils = utilityModule.Require() as { formatTime: (seconds: number) => string };
const formattedTime = utils.formatTime(125); // "2:05"
print(formattedTime);
```

## Best Practices

1. Always specify the script type explicitly in `options`.
2. Use appropriate parent containers for each script type:
    *   `ServerScriptService` or `ServerStorage` for Server Scripts
    *   `StarterPlayerScripts` or `StarterGui` for Local Scripts
    *   `ReplicatedStorage` for shared Module Scripts
3. Handle errors in your callbacks to prevent unexpected behavior.
4. Clean up scripts using `Destroy()` when they're no longer needed to avoid memory leaks.

## License

[MIT License](https://github.com/harihar-nautiyal/script/blob/main/LICENSE) - Feel free to use this package in your Roblox games and modify it as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
```