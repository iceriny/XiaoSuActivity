export interface _module {
    moduleName: string;
    priority: number;


    init(): void;
    Load(): void;
}
export type XS_ModuleName ="Base" | "ActivityModule" | "ChatroomModule" | "CommandsModule";

export abstract class BaseModule implements _module {
    moduleName: XS_ModuleName = 'Base';
    priority: number = 0;
    static Loaded: Boolean = false;

    constructor() {
        this.init();
    }

    public abstract init(): void
    public abstract Load(): void
}