import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction, MSGType, patchFunction, GetModule, SendActivity } from "utils";
// import { TimerProcessInjector } from "./MTimerProcessInjector";


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
    OrgasmTimerLastCycleCall: number = 0;

    private descriptionOfEnduranceActivities = [
        `{source}脚趾一蜷一缩，难耐的交织.`,
        `{source}闭眼忍耐，鼻息中泄露出粉红的喘息.`,
        `{source}蜷缩脚趾忍耐着连续的快感.`,
        `{source}难耐的双腿颤抖着，身体的每一处都充满快感.`,
        `{source}拼命咬住牙齿，却从鼻腔泄露出诱人的声音.`,
        `{source}在汹涌的快感下浑身粉红，奋力的想要忍住高潮.`,
        `{source}浑身颤抖的抵抗高潮的逼近.`
    ];

    get getEndureDesc(): string {
        return this.descriptionOfEnduranceActivities[Math.floor(Math.random() * this.descriptionOfEnduranceActivities.length)];
    }

    hookListHandler(): void {
        // 处理边缘计数计算 并且每45秒 增加一层 抵抗高潮难度  如果高潮则禁用inputChat
        hookFunction("TimerProcess", this.priority, (args, next) => {
            const currentTime = CommonTime();

            if (this.EdgeTimerLastCycleCall == 0) {
                this.EdgeTimerLastCycleCall = currentTime;// 初始化计时器
            }
            if (window.EdgeCount !== undefined && this.EdgeTimerLastCycleCall + 45000 <= currentTime && Player.ArousalSettings?.Progress !== undefined) {
                if (Player.ArousalSettings.Progress >= 93) {
                    window.EdgeCount++;
                    ActivityOrgasmGameResistCount++;
                } else {
                    if (window.EdgeCount >= 1) window.EdgeCount--;
                    if (ActivityOrgasmGameResistCount >= 1) ActivityOrgasmGameResistCount--;
                }
                this.EdgeTimerLastCycleCall = currentTime;
            }


            // ============ // 每1.5秒检查是否高潮或在抵抗  如果高潮则禁用inputChat 如果在抵抗则发送一次抵抗反应
            if (this.OrgasmTimerLastCycleCall == 0) {
                this.OrgasmTimerLastCycleCall = currentTime;
            }
            if (CurrentScreen == "ChatRoom" && Player.MemberNumber !== undefined && this.OrgasmTimerLastCycleCall + 1500 <= currentTime) {
                const inputElement: HTMLTextAreaElement | null = document.getElementById("InputChat") as HTMLTextAreaElement;
                const orgasmStage = Player.ArousalSettings?.OrgasmStage;
                if (orgasmStage == 2 || orgasmStage == 1) {
                    this.setFormElementsForAbsentState(inputElement, true);
                    if (Player.ArousalSettings?.OrgasmStage == 1) {
                        SendActivity(this.getEndureDesc, Player.MemberNumber);
                    }
                    this.OrgasmTimerLastCycleCall = currentTime;
                } else {
                    this.setFormElementsForAbsentState(inputElement, false);
                }
                this.OrgasmTimerLastCycleCall = currentTime;
            }

            return next(args);
        });

        hookFunction("ChatRoomCreateElement", 30, (args, next) => {
            const result = next(args);
            if (CurrentScreen == "ChatRoom") {
                const inputElement: HTMLTextAreaElement | null = document.getElementById("InputChat") as HTMLTextAreaElement;
                this.inputDefaultStyle = {
                    backgroundColor: inputElement.style.backgroundColor,
                    borderColor: inputElement.style.borderColor,
                    borderRadius: inputElement.style.borderRadius
                };
            };
            return result;
        });
    }

    inputDefaultStyle: { backgroundColor: string, borderColor: string, borderRadius: string } | undefined = undefined;

    setFormElementsForAbsentState(formElements: HTMLTextAreaElement | null, isAbsent: boolean): void {
        if (!formElements) return;
        if (isAbsent) {
            if (!formElements.readOnly) {
                formElements.readOnly = true;
                formElements.style.backgroundColor = "#8d6f83";
                formElements.style.borderColor = "#ea44a9";
                formElements.style.borderRadius = "5px";
            }
        } else {
            if (formElements.readOnly) {
                formElements.readOnly = false;
                if (this.inputDefaultStyle) {
                    formElements.style.backgroundColor = this.inputDefaultStyle.backgroundColor;
                    formElements.style.borderColor = this.inputDefaultStyle.borderColor;
                    formElements.style.borderRadius = this.inputDefaultStyle.borderRadius;
                }
            }
        }
    }

    patchListHandler(): void {
        // 处理OrgasmStart
        patchFunction("ActivityOrgasmStart",
            {// XSA补丁处理~ 基础高潮时间为 4~7秒, 每边缘45秒钟增加随机的 300ms ~ 1300ms 的高潮时间。 最多增加 20000ms，也就是最长高潮时间为 27 秒
                "C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;":
                    `if (window.EdgeCount === undefined) {
                C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;
            } else {
                const addedTime = (Math.random() + 0.3) * 1000 * window.EdgeCount;
                C.ArousalSettings.OrgasmTimer = CurrentTime + (addedTime > 20000 ? 20000 : addedTime) + 4000 + (3000 * Math.random());
            }`,
                // 高潮时将抵抗难度减半而非变为0
                "ActivityOrgasmGameResistCount = 0;":
                    "ActivityOrgasmGameResistCount = Math.round(ActivityOrgasmGameResistCount / 2);"
            });

    }
}

