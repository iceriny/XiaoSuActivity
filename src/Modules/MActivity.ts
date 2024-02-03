import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction, MSGType } from "utils";

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
            this.pushToActivity(this.activityToAddDict[a].act);

            this.activityDictAdd();

            const activityDesc = this.activityToAddDict[a].desc;
            activityDesc?.forEach((d) => {
                ActivityDictionary?.push(d);
            });
        }
    }
    //============================================================
    /**
     * 活动添加文字描述
     * @param name - 活动的名称
     * @param target - 对别人的描述
     * @param targetSelf - 对自己的描述
     * @returns - 包含添加的值的数组
     */
    activityDictAdd() {

        for (const a in this.activityToAddDict) {
            const pendingActivity = this.activityToAddDict[a];

            const actName = pendingActivity.act.Name;
            const actTarget = pendingActivity.act.Target;
            const actTargetSelf = pendingActivity.act.TargetSelf;

            const addedValues = [];

            addedValues.push([`ActivityAct_${actName}`, `${actName}`]);
            addedValues.push([`Activity${actName}`, `${actName}`]);
            if (actTarget.length > 0) {
                addedValues.push([`Label-ChatOther-${actTarget}-${actName}`, `${actName}`]);
                addedValues.push([`ChatOther-${actTarget}-${actName}`, pendingActivity.descSting[0]]);
            }
            if (typeof actTargetSelf !== 'undefined' && typeof actTargetSelf !== 'boolean' && actTargetSelf.length > 0) {
                addedValues.push([`Label-ChatSelf-${actTargetSelf}-${actName}`, `${actName}`]);
                addedValues.push([`ChatSelf-${actTargetSelf}-${actName}`, pendingActivity.descSting[1]]);
            }

            pendingActivity.desc = addedValues;
        }
    }
    private pushToActivity(activity: Activity) {

        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
    }
    //============================================================

    //type ActivityNameXiaoSu = "眯眼" | "眼神飘忽" | "甩头发" | "轻抚发梢" | "叼起头发" | "嗅头发" | "皱鼻子" | "打喷嚏" | "深呼吸"
    // SourceCharacter 为动作发起人  TargetCharacter 为动作目标人
    /**
     * 将要添加的动作字典
     * act : Activity Activity如下定义:
     * @param  Name - 活动的名称
     * @param  MaxProgress - 活动的最大进度
     * @param  MaxProgressSelf - 活动自身的最大进度
     * @param  Prerequisite - 活动的前置条件
     * @param  Target - 活动的目标
     * @param  TargetSelf - 活动的自身目标
     * @param  Reverse - 是否反转前置条件的判断
     * @param  MakeSound - 是否播放声音 used for setting {@link ExtendedItemAutoPunishHandled} 
     * @param  StimulationAction - 当使用该活动时触发的动作
     * @param  ActivityExpression - 活动表达式,包含一系列的动作 该活动的默认表达式。可以使用资产上的ActivityExpression进行覆盖。
     * @interface Activity - 上述就是属性为活动的对象的属性
    */
    activityToAddDict: { [ActivityName: string]: { act: Activity, desc: null | string[][], descSting: [string, string] } } = {
        squint: {
            act: {
                Name: "眯眼",
                Target: [""],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descSting: ["", "SourceCharacter眯了眯眼."]
        },
        eyeFlutter: {
            act: {
                Name: "眼神飘忽",
                Target: [""],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descSting: ["", "SourceCharacter眼神飘忽的左看右看."]
        }
    }

}