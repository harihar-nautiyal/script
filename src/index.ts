export { Script } from './Script';

export type ScriptType = "Script" | "LocalScript" | "ModuleScript";

export interface ScriptOptions {
    Name?: string;
    Disabled?: boolean;
    Type?: ScriptType;
    RunContext?: "Server" | "Client" | "Both";
}