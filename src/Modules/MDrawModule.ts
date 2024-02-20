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

        this.Loaded = true;
    }
    public Init(): void {
        this.moduleName = "DrawModule";
        this.priority = 20;
    }

    public static DrawFlashEventMap: Map<symbol, { color: string, time: number, intensity: number, triggered: boolean }>
        = new Map<symbol, { color: string, time: number, intensity: number, triggered: boolean }>();

    public static setFlash(color: string, time: number, intensity: number): void {
        this.DrawFlashEventMap.set(Symbol(), { color: color, time: time, intensity: intensity, triggered: false });
    }

    public static FlashEndTime: number | null = null;


    private static DrawFlash(): void {
        if (this.DrawFlashEventMap.size === 0) return;

        for (const key of this.DrawFlashEventMap.keys()) {
            const event = this.DrawFlashEventMap.get(key)!;
            if (event.triggered) {
                this.DrawFlashEventMap.delete(key);
                continue;
            } else {
                this.FlashEndTime = this.FlashEndTime ?? event.time + CommonTime();
                if (this.FlashEndTime > CommonTime()) {
                    const FlashAlpha = this.DrawGetFlashAlpha(event.time/Math.max(1, 4 - this.FlashEndTime), event.intensity);
                    DrawRect(0, 0, 2000, 1000, event.color + FlashAlpha);
                    break;
                } else {
                    event.triggered = true;
                    this.FlashEndTime = null;
                    continue;
                }
            }
        }
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

}