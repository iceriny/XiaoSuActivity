import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction } from "utils";

/**
 * 进程注入集合
 */
interface IProcessInjectionSet {
    [key: string]: IInjectionCode
}
/**
 * 注入进程对象
 */
export interface IInjectionCode {
    name: string,
    priority: number,
    preconditions: () => boolean,
    timeInterval: number,
    code: () => void
}

export class TimerProcessInjector extends BaseModule {

    /** 注入进程的顺序队列 */
    private static processInjectionSequence: IInjectionCode[] = [];
    /** 注入进程集合 */
    private static processInjectionSet: IProcessInjectionSet = {};
    /** 注入进程集合 需要在Init函数的末尾注入 */
    public static set setProcessInjectionSequence(sequence: IInjectionCode[]) {
        for (const c of sequence) {
            this.processInjectionSet[c.name] = c;
        }
    }

    public Load(): void {
        TimerProcessInjector.ProcessInjection();
        this.Loaded = true;
    }
    public Init(): void {
        this.moduleName = "TimerProcessInjector"
        this.priority = 999;
    }

    /** 记录上次调用时间 的集合 */
    private static TimerLastCycleCallSet: { [name: string]: number } = {};

    /**
     * 时序进程注入
     */
    private static ProcessInjection(): void {
        // 根据优先级排序 从小到大 priority越大越靠后
        TimerProcessInjector.InjectionSort();

        // 设置计时器Set
        for (const c of this.processInjectionSequence) {
            this.TimerLastCycleCallSet[c.name] = -1;
        }

        conDebug(`[TimerProcessInjector] Injection Process... Injection Count: ${this.processInjectionSequence.length}`);
        // 注入TimerProcess
        hookFunction("TimerProcess", 100, (args, next) => {
            const currentTime = CommonTime();
            for (const c of this.processInjectionSequence) {
                //conDebug(`[TimerProcessInjector] ${c.name} is Running...`);

                // 初始化计时器
                if (this.TimerLastCycleCallSet[c.name] == -1) this.TimerLastCycleCallSet[c.name] == currentTime;

                // 判定前置条件 && 时间间隔已到
                if (c.preconditions() && this.TimerLastCycleCallSet[c.name] + c.timeInterval <= currentTime) {
                    c.code();
                    this.TimerLastCycleCallSet[c.name] = currentTime;
                }
                
                //conDebug(`[TimerProcessInjector] ${c.name} is Done.`);
            }

            return next(args);
        });
    }

    /**
     * 注入排序
     */
    private static InjectionSort(): void {
        this.processInjectionSequence = Object.values(this.processInjectionSet)
            .sort((a, b) => a.priority - b.priority);
    }


}