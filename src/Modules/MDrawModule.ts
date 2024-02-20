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

    public static blurLevel: number = 0;

    public static DrawFlashEventMap: Map<symbol, { color: string, time: number, intensity: number, triggered: boolean, callback?: () => void }>
        = new Map<symbol, { color: string, time: number, intensity: number, triggered: boolean, callback?: () => void }>();

    public static setFlash(color: string, time: number, intensity: number, callback?: () => void): void {
        this.DrawFlashEventMap.set(Symbol(), { color: color, time: time, intensity: intensity, triggered: false, callback: callback });
    }

    public static FlashEndTime: number | null = null;


    private static DrawFlash(): void {
        if (this.DrawFlashEventMap.size === 0 && CurrentScreen !== 'ChatRoom') return;

        for (const key of this.DrawFlashEventMap.keys()) {
            const event = this.DrawFlashEventMap.get(key)!;
            if (event.triggered) {
                this.DrawFlashEventMap.delete(key);
                continue;
            } else {
                this.FlashEndTime = this.FlashEndTime ?? event.time + CommonTime();
                if (this.FlashEndTime > CommonTime()) {
                    const FlashAlpha = this.DrawGetFlashAlpha(this.FlashEndTime - CommonTime(), event.intensity);
                    DrawRect(0, 0, 2000, 1000, event.color + FlashAlpha);
                    break;
                } else {
                    event.triggered = true;
                    this.FlashEndTime = null;
                    event.callback?.();
                    continue;
                }
            }
        }
    }

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


