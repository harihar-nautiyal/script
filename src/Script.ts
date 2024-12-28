import { RunService } from "@rbxts/services";

type ScriptType = "Script" | "LocalScript" | "ModuleScript";

interface ScriptOptions {
	Name?: string;
	Disabled?: boolean;
	Type?: ScriptType;
	RunContext?: "Server" | "Client" | "Both";
}

export class Script {
	private instance: Instance;
	private connection?: RBXScriptConnection;
	private callback: () => void;
	private isRunning: boolean = false;
	private scriptType: ScriptType;
	private parent?: Instance;

	constructor(callback: () => void, parent?: Instance, options: ScriptOptions = {}) {
		this.callback = callback;
		this.scriptType = options.Type ?? "Script";
		this.parent = parent;

		// Create the appropriate script instance based on type
		switch (this.scriptType) {
			case "LocalScript":
				this.instance = new Instance("LocalScript");
				break;
			case "ModuleScript":
				this.instance = new Instance("ModuleScript");
				this.setupModuleScript();
				break;
			default:
				this.instance = new Instance("Script");
		}

		// Apply options
		this.instance.Name = options.Name ?? this.scriptType;

		// Set parent if provided
		if (this.parent) {
			this.SetParent(this.parent);
		}

		// Don't auto-start if disabled or if it's a ModuleScript
		if (!options.Disabled && this.scriptType !== "ModuleScript") {
			this.Start();
		}
	}

	private setupModuleScript(): void {
		if (this.scriptType === "ModuleScript") {
			const moduleSource = `
                return function()
                    ${tostring(this.callback)}
                end
            `;
			(this.instance as ModuleScript).Source = moduleSource;
		}
	}

	// Parent management methods
	public SetParent(parent: Instance): void {
		this.instance.Parent = parent;
		this.parent = parent;
	}

	public RemoveParent(): void {
		this.instance.Parent = undefined;
        this.parent = undefined;
	}

	// Methods to replace getters/setters
	public GetName(): string {
		return this.instance.Name;
	}

	public SetName(value: string): void {
		this.instance.Name = value;
	}

	public GetInstance(): Instance {
		return this.instance;
	}

	public GetScriptType(): ScriptType {
		return this.scriptType;
	}

	public Start(): void {
		if (this.isRunning || this.scriptType === "ModuleScript") return;

		// Verify script can run in current context
		if (this.scriptType === "LocalScript" && RunService.IsServer()) {
			warn(`Cannot run LocalScript in server context: ${this.GetName()}`);
			return;
		}
		if (this.scriptType === "Script" && RunService.IsClient()) {
			warn(`Cannot run Script in client context: ${this.GetName()}`);
			return;
		}

		// Connect the callback to RunService.Heartbeat
		this.connection = RunService.Heartbeat.Connect(() => {
			try {
				this.callback();
			} catch (err) {
				warn(`Error in ${this.scriptType} ${this.GetName()}: ${err}`);
			}
		});

		this.isRunning = true;
	}

	public Stop(): void {
		if (!this.isRunning) return;

		this.connection?.Disconnect();
		this.isRunning = false;
	}

	public Destroy(): void {
		this.Stop();
		this.instance.Destroy();
	}

	public Require(): unknown {
		if (this.scriptType !== "ModuleScript") {
			throw "Can only require ModuleScripts";
		}
		return require(this.instance as ModuleScript);
	}
}