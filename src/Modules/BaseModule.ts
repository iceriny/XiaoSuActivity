
export type XS_ModuleName ="Base" | "TimerProcessInjector" | "ActivityModule" | "ChatroomModule" | "CommandsModule" | "DataModule" | "ArousalModule";
export const FullModCount = 6;

export abstract class BaseModule {
    moduleName: XS_ModuleName = "Base";
    priority: number = 0;
    Loaded: Boolean = false;


    public abstract Init(): void
    public abstract Load(): void
}