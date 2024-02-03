import { BaseModule } from "./BaseModule";

export class ActivityModule extends BaseModule {
    moduleName = 'Activity';
    priority = 50;

    init(): void {

    }
    Load(): void {
        this.LoadActivity();
    }
    //============================================================

    LoadActivity(): void {
        for (const a in this.activityToAddDict) {
            this.pushToActivity(this.activityToAddDict[a]);
        }
    }
    //============================================================
    /**
     * 创建活动对象的函数
     * @param  name - 活动的名称
     * @param  maxProgress - 活动的最大进度
     * @param  maxProgressSelf - 活动自身的最大进度
     * @param  prerequisite - 活动的前置条件
     * @param  target - 活动的目标
     * @param  targetSelf - 活动的自身目标
     * @param  reverse - 是否反转前置条件的判断
     * @param  makeSound - 是否播放声音 used for setting {@link ExtendedItemAutoPunishHandled} 
     * @param  stimulationAction - 当使用该活动时触发的动作
     * @param  activityExpression - 活动表达式,包含一系列的动作 该活动的默认表达式。可以使用资产上的ActivityExpression进行覆盖。
     * @returns  - 包含创建的活动信息的对象
     */
    createActivity(
        name: ActivityName,
        maxProgress: number,
        maxProgressSelf: number,
        prerequisite: Array<ActivityPrerequisite>,
        target: AssetGroupItemName,
        targetSelf: AssetGroupItemName,
        reverse?: true,
        makeSound?: boolean,
        stimulationAction?: StimulationAction,
        activityExpression?: Array<ExpressionTrigger>) : Activity {
        const activity: Activity = {
            Name: name,
            Target: [target],
            TargetSelf: [targetSelf],
            MaxProgress: maxProgress,
            MaxProgressSelf: maxProgressSelf,
            Prerequisite: prerequisite,
            ActivityExpression: activityExpression,
        };
        return activity;
    }
    private pushToActivity(activity: Activity) {

        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
    }
    //============================================================
    //type ActivityNameXiaoSu = "眯眼" | "眼神飘忽" | "甩头发" | "轻抚发梢" | "叼起头发" | "嗅头发" | "皱鼻子" | "打喷嚏" | "深呼吸"
    activityToAddDict: { [ActivityName: string]: Activity } = {
        squint: {
            Name: "眯眼",
            Target: [""],
            TargetSelf: ["ItemHead"],
            MaxProgress: 20,
            MaxProgressSelf: 20,
            Prerequisite: [],
            ActivityExpression: []
        },
        eyeFlutter: {
            Name: "眼神飘忽",
            Target: [""],
            TargetSelf: ["ItemHead"],
            MaxProgress: 20,
            MaxProgressSelf: 20,
            Prerequisite: []
        }
    }
}