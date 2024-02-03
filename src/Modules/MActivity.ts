import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction, MSGType } from "utils";

export class ActivityModule extends BaseModule {
    moduleName = 'Activity';
    priority = 50;

    init(): void {

    }
    Load(): void {
        this.LoadActivity();
        hookFunction("ActivityDictionaryText", this.priority, (args, next) => {
            const result = next(args);
            conDebug({
                name: 'ActivityDictionaryText',
                type: MSGType.DebugLog,
                content: args
            });
            // SendChat("我是! 小酥的小白鼠! 吱吱吱吱~~~");
            return result;
        });
    }
    //============================================================

    LoadActivity(): void {
        for (const a in this.activityToAddDict) {
            this.pushToActivity(this.activityToAddDict[a].act);
            const activityDesc = this.activityToAddDict[a].desc;
            activityDesc?.forEach((d) => {
                ActivityDictionary?.push(d);
            });
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
        activityExpression?: Array<ExpressionTrigger>): Activity {
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

    /**
     * 活动添加文字描述
     * @param name - 活动的名称
     * @param target - 对别人的描述
     * @param targetSelf - 对自己的描述
     * @returns - 包含添加的值的数组
     */
    activityDictAdd(name: ActivityName, target: string, targetSelf: string): null | string[][] {
        const addedValues = [];
        // 使用 filter 函数来检查 Name 属性中是否包含指定名称
        const actActivityFemale3DCG = ActivityFemale3DCG.filter(activity => {
            conDebug({
                name: 'ActivityFemale3DCG',
                type: MSGType.DebugLog,
                content: activity
            });
            return activity?.Name?.includes(name);
        });
        if (actActivityFemale3DCG.length > 0) {
            const actName = actActivityFemale3DCG[0].Name;
            const actNameWithoutPrefix = actName.substring(4);
            const actTarget = actActivityFemale3DCG[0].Target;
            const actTargetSelf = actActivityFemale3DCG[0].TargetSelf;

            addedValues.push([`ActivityAct_${actNameWithoutPrefix}`, `${actNameWithoutPrefix}`]);
            if (actTarget.length > 0) {
                addedValues.push([`Label-ChatOther-${actTarget}-${actName}`, `${actNameWithoutPrefix}`]);
                addedValues.push([`ChatOther-${actTarget}-${actName}`, target]);
            }
            if (typeof actTargetSelf !== 'undefined' && typeof actTargetSelf !== 'boolean' && actTargetSelf.length > 0) {
                addedValues.push([`Label-ChatSelf-${actTargetSelf}-${actName}`, `${actNameWithoutPrefix}`]);
                addedValues.push([`ChatSelf-${actTargetSelf}-${actName}`, targetSelf]);
            }
        }
        // 返回添加的值的数组
        return addedValues;
    }
    private pushToActivity(activity: Activity) {

        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
    }
    //============================================================
    //type ActivityNameXiaoSu = "眯眼" | "眼神飘忽" | "甩头发" | "轻抚发梢" | "叼起头发" | "嗅头发" | "皱鼻子" | "打喷嚏" | "深呼吸"
    // SourceCharacter 为动作发起人  TargetCharacter 为动作目标人
    activityToAddDict: { [ActivityName: string]: { act: Activity, desc: null | string[][] } } = {
        squint: {
            act: {
                Name: "眯眼",
                Target: [""],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: [],
                ActivityExpression: []
            },
            desc: this.activityDictAdd("眯眼", "", "SourceCharacter眯了眯眼.")
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
            desc: this.activityDictAdd("眼神飘忽", "", "SourceCharacter眼神飘忽的左看右看.")
        }
    }

}