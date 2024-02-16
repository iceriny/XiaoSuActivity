/**
 * mod模块名称定义
 */
export type XS_ModuleName = "Base" | "TimerProcessInjector" | "ActivityModule" | "ChatroomModule" | "CommandsModule" | "DataModule" | "ArousalModule";
/**
 * 完整模块数量
 */
export const FullModCount = 6;


/**
 * 模块的基础抽象类
 */
export abstract class BaseModule {
    /** 模块名 */
    moduleName: XS_ModuleName = "Base";
    /** 模块优先级 数越大越靠后加载 */
    priority: number = 0;
    /** 是否加载完成 */
    Loaded: boolean = false;


    /**
     * 初始化函数
     */
    public abstract Init(): void
    /**
     * 加载函数
     */
    public abstract Load(): void
}