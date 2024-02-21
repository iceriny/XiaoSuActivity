/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseModule } from "./BaseModule";
import { conDebug, GetModule, timeRange, sendChangeLog, MSGType, hookFunction } from "utils";


export class DrawModule extends BaseModule {

    public Load(): void {

        // 绘制闪光的hook
        hookFunction("DrawProcessScreenFlash", 999, (args, next) => {
            DrawModule.DrawFlash();
            return next(args);
        });

        // 绘制模糊效果的hook
        hookFunction('Player.GetBlurLevel', -999, (args, next) => {
            let blurLevel = next(args);
            if (!CommonPhotoMode && blurLevel === 0 && DrawModule.blurLevel !== 0) {
                blurLevel = DrawModule.blurLevel;
            }
            return blurLevel;
        });

        this.Loaded = true;
    }
    public Init(): void {
        this.moduleName = "DrawModule";
        this.priority = 20;
    }

    /** 模糊等级 */
    public static blurLevel: number = 0;

    /** 绘制闪光事件map */
    public static DrawFlashEventMap: Map<symbol, { color: string, time: number, intensity: number, evenEnd: boolean, callback?: () => void }>
        = new Map<symbol, { color: string, time: number, intensity: number, evenEnd: boolean, callback?: () => void }>();

    /**
     * 设置一个闪光事件
     * @param color 闪光颜色
     * @param time 闪光时间
     * @param intensity 闪光强度
     * @param callback 闪光结束后的回调函数
     */
    public static setFlash(color: string, time: number, intensity: number, callback?: () => void): void {
        this.DrawFlashEventMap.set(Symbol(), { color: color, time: time, intensity: intensity, evenEnd: false, callback: callback });
    }

    /** 当前正在处理的闪光事件的结束时间 */
    public static FlashEndTime: number | null = null;


    /**
     * 绘制闪光效果
     */
    private static DrawFlash(): void {
        // 如果当前屏幕不是聊天室且没有触发的闪光事件，则直接返回
        if (CurrentScreen !== 'ChatRoom' && this.DrawFlashEventMap.size === 0) return;

        // 遍历所有触发的闪光事件
        for (const [key, event] of this.DrawFlashEventMap.entries()) {
            // 如果事件触发已完成，则删除该事件并继续处理下一个事件
            if (event.evenEnd) {
                this.DrawFlashEventMap.delete(key);
                continue;
            }
            // 获取当前时间
            const commonTime = CommonTime();
            // 闪光结束时间 如果存在则不变 如果不存在则初始化为当前时间加上闪光时间
            this.FlashEndTime = this.FlashEndTime ?? event.time + commonTime;
            // 如果闪光结束时间晚于当前时间
            if (this.FlashEndTime > commonTime) {
                // 计算闪光的透明度
                const FlashAlpha = this.DrawGetFlashAlpha(this.FlashEndTime - commonTime, event.intensity);
                // 绘制矩形
                DrawRect(0, 0, 2000, 1000, event.color + FlashAlpha);
                // 跳出循环进入调用本函数的下一个大循环
                break;
            } else {
                // 标记事件触发完成
                event.evenEnd = true;
                // 清空闪光结束时间 以备下个事件使用
                this.FlashEndTime = null;
                // 调用回调函数
                event.callback?.();
                continue;
            }
        }
    }

    /**
     * 设置当前屏幕模糊并持续一段时间
     * @param duration 持续时间
     * @param level 模糊等级
     */
    public static setDrawBlur(duration: number, level: number) {
        this.blurLevel = level;
        setTimeout(() => {
            this.blurLevel = 0;
        }, duration);
    }

    /**
     * Gets the alpha of a screen flash. append to a color like "#111111" + DrawGetScreenFlash(FlashTime)
     * @param  flashTime - Time remaining as part of the screen flash
     * @param flashIntensity - Intensity of the screen flash
     * @returns - alpha of screen flash
     */
    private static DrawGetFlashAlpha(flashTime: number, flashIntensity: number) {
        let alpha = Math.max(0, Math.min(255, Math.floor(flashIntensity * (1 - Math.exp(-flashTime / 2500))))).toString(16);
        if (alpha.length < 2) alpha = "0" + alpha;
        return alpha;
    }


    /**
     * Calculates dynamic intensity based on elapsed time.
     * This example simulates a flickering effect.
     * @param elapsedTime - The time elapsed since the flash started, in milliseconds.
     * @param baseIntensity - The base intensity of the flash.
     * @param totalDuration - The total duration of the flash.
     * @returns - Adjusted intensity.
     */
    private static calculateDynamicIntensity(elapsedTime: number, baseIntensity: number, totalDuration: number): number {
        // Oscillation period (in milliseconds)
        const period = 500;
        // Calculate phase of the sine wave
        const phase = (2 * Math.PI * elapsedTime) / period;
        // Oscillate intensity around the baseIntensity value
        return baseIntensity + baseIntensity * 0.1 * Math.sin(phase);
    }

}


