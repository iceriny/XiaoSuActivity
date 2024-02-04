import { BaseModule } from "./BaseModule";
import { conDebug, hookFunction, MSGType } from "utils";

/*
 * 动作的限定条件信息对象
*/
interface prerequisite {
    Name: ActivityPrerequisiteXiaoSu;
    Action: (args: any) => boolean;
}
export class ActivityModule extends BaseModule {
    moduleName = 'Activity';
    priority = 50;

    init(): void {

    }
    Load(): void {
        this.LoadActivity();

        hookFunction("ServerSend", 5, (args, next) => { // ServerSend 只能检测自己发出的聊天信息 可以用来替换自己发出去的文字
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity") {
                let data = args[1];
                let actName = data.Dictionary[3]?.ActivityName ?? "";
                if (actName.indexOf("XSAct_") == 0) { // 这个条件表示只有当消息中包含以 "XSAct_" 开头的自定义活动时,才会执行下面的操作
                    // 拦截自定义活动的发送并执行自定义操作
                    let { metadata, substitutions } = ChatRoomMessageRunExtractors(data, Player)
                    let msg = ActivityDictionaryText(data.Content);
                    msg = CommonStringSubstitute(msg, substitutions ?? [])
                    data.Dictionary.push({
                        Tag: "MISSING ACTIVITY DESCRIPTION FOR KEYWORD " + data.Content,
                        Text: msg
                    });
                }
            }
            return next(args);
        });

        hookFunction("ActivityCheckPrerequisite", 500, (args, next) => {
            // conDebug({
            //     name: "ActivityCheckPrerequisite",
            //     type: MSGType.DebugLog,
            //     content: args
            // });
            const prereq = args[0];
            const customPrereq = this.prerequisiteDict[prereq];
            if (typeof customPrereq === "undefined") return next(args);
            else return this.prerequisiteDict[prereq].Action(args);
        });
    }

    // hook:




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
            const nameWithoutPrefix = actName.substring(6);
            const actTarget = pendingActivity.act.Target;
            const actTargetSelf = pendingActivity.act.TargetSelf;

            const addedValues = [];

            addedValues.push([`ActivityAct_${actName}`, `${nameWithoutPrefix}`]);
            addedValues.push([`Activity${actName}`, `${nameWithoutPrefix}`]);
            if (actTarget.length > 0) {
                addedValues.push([`Label-ChatOther-${actTarget}-${actName}`, `${nameWithoutPrefix}`]);
                addedValues.push([`ChatOther-${actTarget}-${actName}`, pendingActivity.descSting[0]]);
            }
            if (typeof actTargetSelf !== 'undefined' && typeof actTargetSelf !== 'boolean' && actTargetSelf.length > 0) {
                addedValues.push([`Label-ChatSelf-${actTargetSelf}-${actName}`, `${nameWithoutPrefix}`]);
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

    // ActivityNameXiaoSu = "XSAct_眯眼" | "XSAct_眼神飘忽" | "XSAct_甩头发" | "XSAct_轻抚发梢" | "XSAct_叼起头发" | "XSAct_嗅头发" | "XSAct_皱鼻子" | "XSAct_打喷嚏" | "XSAct_深呼吸"
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
                Name: "XSAct_眯眼",
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
                Name: "XSAct_眼神飘忽",
                Target: [""],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descSting: ["", "SourceCharacter眼神飘忽的左看右看."]
        },
        tossHair: {
            act: {
                Name: "XSAct_甩头发",
                Target: [""],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHood"]
            },
            desc: null,
            descSting: ["", "SourceCharacter甩动着头发."]

        }
    }

    prerequisiteDict: { [PrerequisiteName: string]: prerequisite } = {
        'ItemHood': {
            Name: "ItemHood",
            Action: (args) => {
                //const prereq = args[0] as ActivityPrerequisite;
                const acting = args[1] as Character | PlayerCharacter;
                //const acted = args[2] as Character | PlayerCharacter;
                //const group = args[3] as AssetGroup;

                return this.Judgment.ItemHood(acting);
            }
        }
    }

    Judgment: { [judgmentName: string]: (acting: Character | PlayerCharacter, acted?: Character | PlayerCharacter, group?: AssetGroup) => boolean } = {
        ItemHood: (acting: Character | PlayerCharacter): boolean => {
            return InventoryPrerequisiteMessage(acting, "HoodEmpty") !== ""
        }
    }
}