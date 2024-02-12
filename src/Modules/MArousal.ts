import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction, MSGType, patchFunction, isDivisible } from "utils";


export class ArousalModule extends BaseModule {
    public init(): void {
        this.moduleName = "ArousalModule";
        this.priority = 60;
    }

    public Load(): void {
        window.EdgeCount = 0;
        this.hookListHandler();
        this.patchListHandler();

        this.Loaded = true;
    }

    EdgeTimerLastCycleCall: number = 0;



    hookListHandler(): void {
        // 处理边缘计数计算 并且每十秒增加抵抗高潮难度
        hookFunction("TimerProcess", this.priority, (args, next) => {
            const currentTime = CommonTime();

            if (this.EdgeTimerLastCycleCall === 0) this.EdgeTimerLastCycleCall = currentTime;// 初始化计时器
            if (window.EdgeCount !== undefined && this.EdgeTimerLastCycleCall + 10000 <= currentTime && Player.ArousalSettings?.Progress !== undefined) {
                if (Player.ArousalSettings.Progress >= 93) {
                    window.EdgeCount++;
                    ActivityOrgasmGameResistCount++;
                    this.EdgeTimerLastCycleCall = currentTime;
                } else {
                    if (window.EdgeCount >= 1) window.EdgeCount--;
                    if (ActivityOrgasmGameResistCount >= 1) ActivityOrgasmGameResistCount--;
                }
            }

            next(args);
        });
    }

    patchListHandler(): void {
        // 处理OrgasmStart
        patchFunction("ActivityOrgasmStart",
            {// XSA补丁处理~ 基础高潮时间为 4~7秒, 每边缘10秒钟增加随机的 500ms ~ 1000ms 的高潮时间。 最多增加 43000ms，也就是最长高潮时间为 50 秒
                "C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;": `if (window.EdgeCount === undefined) {
                C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;
            } else {
                const addedTime = (Math.random() + 0.5) * window.EdgeCount * 1000;
                C.ArousalSettings.OrgasmTimer = CurrentTime + (addedTime > 43000 ? 43000 : addedTime) + 4000 + (3000 * Math.random());
            }`
            });
    }
}

