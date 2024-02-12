
export type XS_ModuleName ="Base" | "ActivityModule" | "ChatroomModule" | "CommandsModule" | "DataModule" | "ArousalModule";
export const FullModCount = 5;

export abstract class BaseModule {
    moduleName: XS_ModuleName = "Base";
    priority: number = 0;
    Loaded: Boolean = false;

    constructor() {
        this.init();
    }

    public abstract init(): void
    public abstract Load(): void
}