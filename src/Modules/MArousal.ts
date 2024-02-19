import { BaseModule } from "./BaseModule";
import { DataModule } from "./MData";
import { patchFunction, SendActivity } from "utils";
import { TimerProcessInjector } from "./MTimerProcessInjector";


export class ArousalModule extends BaseModule {
    public Init(): void {
        this.moduleName = "ArousalModule";
        this.priority = 60;

        TimerProcessInjector.setProcessInjectionSequence = [
            {// 处理边缘计数计算 并且每45秒 增加一层 抵抗高潮难度  如果高潮则禁用inputChat
                name: "EdgeTimerLastCycleCall",
                priority: 0,
                preconditions: () => Player.ArousalSettings?.Progress !== undefined,
                timeInterval: 45000,
                code: () => {
                    if (Player.ArousalSettings!.Progress >= 93) {
                        ActivityOrgasmGameResistCount++;
                        DataModule.SaveData({ resistCount: ActivityOrgasmGameResistCount, Player_Progress: Player.ArousalSettings!.Progress });
                    } else {
                        if (ActivityOrgasmGameResistCount >= 1) ActivityOrgasmGameResistCount--;
                    }
                }
            },
            {// 每1.5秒检查是否高潮或在抵抗  如果高潮则禁用inputChat 如果在抵抗则每1.5秒有30%概率发送一次抵抗反应
                name: "OrgasmTimerLastCycleCall",
                priority: 1,
                preconditions: () => CurrentScreen == "ChatRoom" && Player.MemberNumber !== undefined,
                timeInterval: 1500,
                code: () => {
                    const inputElement: HTMLTextAreaElement | null = document.getElementById("InputChat") as HTMLTextAreaElement;
                    const orgasmStage = Player.ArousalSettings?.OrgasmStage;
                    if (orgasmStage == 2 || orgasmStage == 1) {
                        this.setFormElementsForAbsentState(inputElement, true);
                        if (Player.ArousalSettings?.OrgasmStage == 1) {
                            if (Math.random() < 0.3) SendActivity(this.getEndureDesc, Player.MemberNumber!);
                        }
                    } else {
                        this.setFormElementsForAbsentState(inputElement, false);
                    }
                }
            }
        ];
    }

    public Load(): void {
        this.patchListHandler();
        this.Loaded = true;
    }

    /** 对于忍耐高潮时的反应描述 */
    private descriptionOfEnduranceActivities = [
        `{source}脚趾一蜷一缩，难耐的交织.`,
        `{source}闭眼忍耐，鼻息中泄露出粉红的喘息.`,
        `{source}蜷缩脚趾忍耐着连续的快感.`,
        `{source}难耐的双腿颤抖着，身体的每一处都充满快感.`,
        `{source}拼命咬住牙齿，却从鼻腔泄露出诱人的声音.`,
        `{source}在汹涌的快感下浑身粉红，奋力的想要忍住高潮.`,
        `{source}浑身颤抖的抵抗高潮的逼近.`
    ];

    /** 获取忍耐高潮时的反应描述 */
    get getEndureDesc(): string {
        return this.descriptionOfEnduranceActivities[Math.floor(Math.random() * this.descriptionOfEnduranceActivities.length)];
    }



    /** 默认的输入框样式 */
    inputDefaultStyle: { backgroundColor: string, borderColor: string, borderRadius: string } | undefined = undefined;

    /**
     * 获取{@link HTMLTextAreaElement}的默认样式，根据{@param isAbsent}决定是否禁用或取消禁用
}
     * @param formElements 表单元素
     * @param isAbsent 是否为失能状态
     * @returns 无
     */
    setFormElementsForAbsentState(formElements: HTMLTextAreaElement | null, isAbsent: boolean): void {
        if (!formElements) return;
        if (isAbsent) {
            if (!formElements.readOnly) {
                if (!this.inputDefaultStyle) {
                    this.inputDefaultStyle = {
                        backgroundColor: formElements.style.backgroundColor,
                        borderColor: formElements.style.borderColor,
                        borderRadius: formElements.style.borderRadius
                    };
                }
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

    /**
     * 补丁列表处理
     */
    patchListHandler(): void {
        // 处理OrgasmStart
        patchFunction("ActivityOrgasmStart",
            {// XSA补丁处理~ 基础高潮时间为 4~7秒, 每边缘45秒钟增加随机的 300ms ~ 1300ms 的高潮时间。 最多增加 20000ms，也就是最长高潮时间为 27 秒
                "C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;":
                    `if (window?.XSActivity_Loaded === undefined) {
                C.ArousalSettings.OrgasmTimer = CurrentTime + (Math.random() * 10000) + 5000;
            } else {
                const addedTime = (Math.random() + 0.3) * 1000 * ActivityOrgasmGameResistCount;
                C.ArousalSettings.OrgasmTimer = CurrentTime + (addedTime > 20000 ? 20000 : addedTime) + 4000 + (3000 * Math.random());
            }`,
                // 高潮时将抵抗难度减半而非变为0
                "ActivityOrgasmGameResistCount = 0;":
                    "ActivityOrgasmGameResistCount = Math.round(ActivityOrgasmGameResistCount / 2);"
            });
    }

}

