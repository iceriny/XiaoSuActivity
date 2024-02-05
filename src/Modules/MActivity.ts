import { BaseModule, _module } from "./BaseModule";
import { conDebug, hookFunction, MSGType } from "utils";

/*
 * 动作的限定条件信息对象
*/
interface prerequisite {
    Name: ActivityPrerequisiteXiaoSu;
    Action: (args: any) => boolean;
}
export class ActivityModule extends BaseModule implements _module{
    moduleName = 'ActivityModule';
    priority = 50;


    init(): void {

    }
    Load(): void {
        this.LoadActivity();

        /**
         * 处理没有装本插件的玩家接受到的消息
         * 原理为使用hookFunction来拦截ServerSend函数的执行,并判断消息中是否包含自定义活动的关键词,如果包含则执行自定义操作
         * - 即替换原本的描述
         */
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

        /**
         * 1. 当条件关键词为自定义关键词时
         * - 处理限制条件
         * 2. 当关键词不是自定义关键词时
         * - 执行原方法
         */
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

        /**
         * "Assets/Female3DCG/Activity/XSAct_眯眼.png"
         */
        hookFunction("DrawImageResize", 10, (args, next) => {
            const source = args[0];

            // 使用 split 方法拆分字符串
            const parts = source.split('/');
            const fileName = parts[parts.length - 1];  // 获取文件名部分，即 "XSAct_XXX.png"

            // 进一步处理文件名，去掉 ".png" 后缀
            const aName = fileName.replace('.png', '');

            if (aName.indexOf("XSAct_") == 0) {
                const resultName = `Assets/Female3DCG/Activity/${this.activityToAddDict[aName].img}.png`;
                args[0] = resultName;
                return next(args);
            }


            return next(args);
        });
    }

    // hook:




    //============================================================

    /**
     * 载入自定义动作
     */
    LoadActivity(): void {
        for (const a in this.activityToAddDict) { // a 为活动名
            this.pushToActivity(this.activityToAddDict[a].act);

            this.activityDictAdd();

            //加载文字描述
            const activityDesc = this.activityToAddDict[a].desc;
            activityDesc?.forEach((d) => {
                ActivityDictionary?.push(d);
            });
        }
    }
    //============================================================
    /**
     * 初始化活动的文字描述。
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
                addedValues.push([`ChatOther-${actTarget}-${actName}`, pendingActivity.descString[0]]);
            }
            if (typeof actTargetSelf !== 'undefined' && typeof actTargetSelf !== 'boolean' && actTargetSelf.length > 0) {
                addedValues.push([`Label-ChatSelf-${actTargetSelf}-${actName}`, `${nameWithoutPrefix}`]);
                addedValues.push([`ChatSelf-${actTargetSelf}-${actName}`, pendingActivity.descString[1]]);
            }

            pendingActivity.desc = addedValues;
        }
    }
    /**
     * 将传入的活动对象载入
     * @param activity 将要载入的活动对象
     */
    private pushToActivity(activity: Activity) {

        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
    }
    //============================================================

    // ActivityNameXiaoSu = "XSAct_眯眼" | "XSAct_眼神飘忽" | "XSAct_甩头发" | "XSAct_轻抚发梢" | "XSAct_叼起头发" | "XSAct_嗅头发" | "XSAct_皱鼻子" | "XSAct_打喷嚏" | "XSAct_深呼吸"
    // SourceCharacter 为动作发起人  TargetCharacter 为动作目标人
    /**
     * 将要添加的动作字典
     * @interface Activity - Activity对象的属性如下定义:
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
     * -------
     * @desc - desc默认需要为null,当活动初始化时,会自动添加文字描述
     * @descString - 两个元素的数组 [0]为如果目标为他人的描述，[1]为目标自己的描述
    */
    activityToAddDict: { [ActivityName: string]: { act: Activity, desc: null | string[][], descString: [string, string], img: ActivityName } } = {
        XSAct_眯眼: {
            act: {
                Name: "XSAct_眯眼",
                Target: [""],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", "SourceCharacter眯了眯眼."],
            img: "RestHead"
        },
        XSAct_眼神飘忽: {
            act: {
                Name: "XSAct_眼神飘忽",
                Target: [""],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", "SourceCharacter眼神飘忽的左看右看."],
            img: "RestHead"
        },
        XSAct_甩头发: {
            act: {
                Name: "XSAct_甩头发",
                Target: [""],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered"]
            },
            desc: null,
            descString: ["", "SourceCharacter甩动着头发."],
            img: "RestHead"
        },
        XSAct_轻抚发梢: {
            act: {
                Name: "XSAct_轻抚发梢",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered", "TargetItemHoodCovered", "CantUseArms"]
            },
            desc: null,
            descString: ["SourceCharacter轻柔抚动着TargetCharacter的头发.", "SourceCharacter轻柔抚动着自己的头发."],
            img: "RestHead"
        },
        XSAct_叼起头发: {
            act: {
                Name: "XSAct_叼起头发",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth", "ItemHoodCovered", "TargetItemHoodCovered"],
                StimulationAction: "Talk"
            },
            desc: null,
            descString: ["SourceCharacter轻轻咬起TargetCharacter的头发.", "SourceCharacter轻轻咬起自己的头发."],
            img: "SiblingsCheekKiss"
        },
        XSAct_嗅头发: {
            act: {
                Name: "XSAct_嗅头发",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered", "TargetItemHoodCovered"],//"ItemNoseCovered"
                StimulationAction: "Talk"
            },
            desc: null,
            descString: ["SourceCharacter在TargetCharacter的发间嗅着，鼻息弥漫着TargetCharacter的发香.", "SourceCharacter撩起自己的头发轻轻嗅着."],
            img: "SiblingsCheekKiss"
        },
        XSAct_皱鼻子: {
            act: {
                Name: "XSAct_皱鼻子",
                Target: [""],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered"]// , "ItemNoseCovered"]
            },
            desc: null,
            descString: ["", "SourceCharacter皱了皱自己的鼻头."],
            img: "RestHead"
        },
        XSAct_打喷嚏: {
            act: {
                Name: "XSAct_打喷嚏",
                Target: [""],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth", "ItemHoodCovered"],
                StimulationAction: "Talk"
            },
            desc: null,
            descString: ["", "SourceCharacter打了个喷嚏."],
            img: "Kiss"
        },
        XSAct_深呼吸: {
            act: {
                Name: "XSAct_深呼吸",
                Target: [""],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth", "ItemHoodCovered"],////////////////////////////
                StimulationAction: "Talk"
            },
            desc: null,
            descString: ["", "SourceCharacter皱了皱自己的鼻头."],
            img: "Kiss"
        }
    }

    /**
     * 前置条件字典
     * @PrerequisiteName - 需要是在{@link ActivityPrerequisiteXiaoSu}的字符串
     * @Name - 需要是在{@link ActivityPrerequisiteXiaoSu}的字符串
     * @Action - 检测判断的具体动作
     * - @param args - 一个数组,包含四个元素.
     * - args[0]为@param prereq:{@link ActivityPrerequisite} 判定决定使用哪个条件的依据，但此处无用 请不要在这里使用该参数
     * - args[1]为@param acting:{@link Character} | {@link PlayerCharacter} 代表动作发起者的数据
     * - args[2]为@param acted:{@link Character} | {@link PlayerCharacter} 代表动作目标的数据
     * - args[3]为@param group:{@link AssetGroup}.
     */
    prerequisiteDict: { [PrerequisiteName: string]: prerequisite } = {
        'ItemHoodCovered': { //头部面罩位置是否覆盖
            Name: "ItemHoodCovered",
            Action: (args) => {
                //const prereq = args[0] as ActivityPrerequisite;
                const acting = args[1] as Character | PlayerCharacter;
                //const acted = args[2] as Character | PlayerCharacter;
                //const group = args[3] as AssetGroup;

                return this.Judgment.ItemHoodCovered(acting);
            }
        },
        'TargetItemHoodCovered': { //目标的头部面罩位置是否覆盖
            Name: "TargetItemHoodCovered",
            Action: (args) => {
                const acted = args[2] as Character | PlayerCharacter;

                return this.Judgment.ItemHoodCovered(acted);
            }
        },
        'ItemNoseCovered': { //头部鼻子位置是否覆盖
            Name: "ItemNoseCovered",
            Action: (args) => {
                const acting = args[1] as Character | PlayerCharacter;

                return this.Judgment.ItemNoseCovered(acting);
            }
        }
    }
    /**
     * 判断函数字典
     * 前置条件字典将要调用的方法集合
    */
    Judgment: { [judgmentName: string]: (acting: Character | PlayerCharacter, acted?: Character | PlayerCharacter, group?: AssetGroup) => boolean } = {
        ItemHoodCovered: (acting: Character | PlayerCharacter): boolean => { // 头部面罩位置是否覆盖
            return InventoryPrerequisiteMessage(acting, "HoodEmpty") === "";
        },
        ItemNoseCovered: (acting: Character | PlayerCharacter): boolean => { // 鼻子位置是否覆盖 // 暂时无效 回头修复
            return InventoryGroupIsBlocked(acting, "NoseEmpty");
        }
    }

    // /**
    //  * 通过动作名字得到路径
    //  */
    // GetActImgPathMap: { [actName: string]: [ActivityName, ActivityName] } = {}

    // //Assets/Female3DCG/Activity/
    // InitActImgPathMap(): void {
    //     for (const a in this.activityToAddDict) {
    //         const _act = this.activityToAddDict[a];
    //         const _actName = _act.act.Name;

    //         this.GetActImgPathMap[_actName] = [_actName, _act.img]
    //     }
    // }
}
