import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction } from "utils";

/**
 * 进程注入集合
 */
interface IProcessInjectionSetOBJ {
    [key: string]: IInjectionCode
}
/**
 * 注入进程对象
 */
export interface IInjectionCode {
    name: string,
    priority: number,
    preconditions: () => boolean,
    timeInterval: number | (() => number),
    code: () => void
}

export class TimerProcessInjector extends BaseModule {

    /** 注入进程的顺序队列 */
    private static processInjectionSequence: IInjectionCode[] = [];
    /** 注入进程集合 */
    private static processInjectionSet: IProcessInjectionSetOBJ = {};
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

    /** 记录上次调用时间 & 时间间隔 的集合 */
    private static TimerLastCycleCallSet: { [name: string]: { timerLastCycleCall: number, timeInterval: number, isDynamic: boolean, getTimeInterval?: () => number } } = {};

    /**
     * 时序进程注入
     */
    private static ProcessInjection(): void {
        // 根据优先级排序 从小到大 priority越大越靠后
        this.InjectionSort();

        // 设置计时器Set
        for (const c of this.processInjectionSequence) {
            if (typeof c.timeInterval == 'number') {
                this.TimerLastCycleCallSet[c.name] = {
                    timerLastCycleCall: -1,
                    timeInterval: c.timeInterval,
                    isDynamic: false
                }
            } else {
                this.TimerLastCycleCallSet[c.name] = {
                    timerLastCycleCall: -1,
                    timeInterval: c.timeInterval(),
                    isDynamic: true,
                    getTimeInterval: c.timeInterval
                }
            }

        }

        conDebug(`[TimerProcessInjector] Injection Process... Injection Count: ${this.processInjectionSequence.length}`);
        // 注入TimerProcess
        hookFunction("TimerProcess", 100, (args, next) => {
            const currentTime = CommonTime();
            for (const c of this.processInjectionSequence) {

                // 初始化计时器
                if (this.TimerLastCycleCallSet[c.name].timerLastCycleCall == -1) this.TimerLastCycleCallSet[c.name].timerLastCycleCall == currentTime;

                // 判定前置条件 && 时间间隔已到
                if (c.preconditions() && this.TimerLastCycleCallSet[c.name].timerLastCycleCall + this.TimerLastCycleCallSet[c.name].timeInterval <= currentTime) {
                    if (c.name == 'RandomTrance'){
                        conDebug(`[TimerProcessInjector]\n 恍惚触发!!`);
                    }
                    c.code();
                    if (typeof c.timeInterval !== 'number') {
                        conDebug(`[TimerProcessInjector] ${c.name} is Dynamic... value: ${this.TimerLastCycleCallSet[c.name].timeInterval}.`);
                    }

                    this.TimerLastCycleCallSet[c.name].timerLastCycleCall = currentTime;
                    if (this.TimerLastCycleCallSet[c.name].isDynamic) {
                        this.TimerLastCycleCallSet[c.name].timeInterval = this.TimerLastCycleCallSet[c.name].getTimeInterval!();
                        conDebug(`[TimerProcessInjector] ${c.name} is Dynamic... value: ${this.TimerLastCycleCallSet[c.name].timeInterval}.`);
                    }
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