import { conDebug, hookFunction, MSGType, SendActivity } from "utils";
import { BaseModule } from "./BaseModule";

/*
 * 动作的限定条件信息对象
*/
interface prerequisite {
    Name: XSA_ActivityPrerequisite;
    Action: (args: Array<unknown>) => boolean;
}

/**
 * 描述中表示自己的占位符
 */
const selfPlaceholder = "SourceCharacter";
/** 描述中表示目标的占位符 */
const targetPlaceholder = "TargetCharacter";

/**
 * 动作模块的类
 * 涉及功能有"
 * - 添加自定义动作
 * - 接受特定动作的特殊效果 当前为瘙痒增加高潮抵抗难度
 */
export class ActivityModule extends BaseModule {


    public Init(): void {
        this.priority = 50;
    }
    public Load(): void {
        this.LoadActivity();
        this.hookListHandler();
        this.Loaded = true;
    }

    // hook:



    /**
     * 狗子函数队列处理
     */
    hookListHandler(): void {
        /**
         * 处理没有装本插件的玩家接受到的消息
         * 原理为使用hookFunction来拦截ServerSend函数的执行,并判断消息中是否包含自定义活动的关键词,如果包含则执行自定义操作
         * - 即替换原本的描述
         */
        hookFunction("ServerSend", 5, (args, next) => { // ServerSend 只能检测自己发出的聊天信息 可以用来替换自己发出去的文字
            if (args[0] == "ChatRoomChat" && args[1]?.Type == "Activity") {
                const data = args[1];
                const actName = data.Dictionary[3]?.ActivityName ?? "";
                if (actName.indexOf("XSAct_") == 0) { // 这个条件表示只有当消息中包含以 "XSAct_" 开头的自定义活动时,才会执行下面的操作
                    // 拦截自定义活动的发送并执行自定义操作
                    const { substitutions } = ChatRoomMessageRunExtractors(data, Player)
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
            const prereq = args[0];
            if (prereq in this.prerequisiteDict) {
                const customPrereq = this.prerequisiteDict[prereq as XSA_ActivityPrerequisite];
                return customPrereq.Action(args);
            } else {
                return next(args);
            }
        });

        /**
         * args[0]: "Assets/Female3DCG/Activity/XSAct_XXX.png"
         */
        hookFunction("DrawImageResize", 10, (args, next) => {
            const source = args[0];

            if (typeof source !== "string") return next(args);
            // 使用 split 方法拆分字符串
            const parts = source.split('/');
            const fileName = parts[parts.length - 1];  // 获取文件名部分，即 "XSAct_XXX.png"

            // 进一步处理文件名，去掉 ".png" 后缀
            const aName = fileName.replace('.png', '');

            if (aName.indexOf("XSAct_") == 0) {
                const resultName = `Assets/Female3DCG/Activity/${this.activityToAddDict[aName as XSA_ActivityName].img}.png`;
                args[0] = resultName;
                return next(args);
            }
            return next(args);
        });



        /** 瘙痒动作增加抵抗难度 */
        hookFunction("ChatRoomMessage", this.priority, (args, next) => {
            const data = args[0];
            conDebug({
                name: "ChatRoomMessage",
                type: MSGType.DebugLog,
                content: data
            });
            // 确定是否是活动消息
            if (data.Type == "Activity") {
                const actName = data.Dictionary[3]?.ActivityName as string;
                const SourceCharacter = data.Dictionary[0]?.SourceCharacter as number;
                const TargetCharacter = data.Dictionary[1]?.TargetCharacter as number;
                if (actName == "Tickle" && !Number.isNaN(TargetCharacter) && TargetCharacter == Player?.MemberNumber) {// 瘙痒动作且目标为自己
                    conDebug({
                        type: MSGType.DebugLog,
                        name: "检测到自己为目标的瘙痒动作",
                        content: {
                            高潮阶段: Player.ArousalSettings?.OrgasmStage,
                            抵抗难度: ActivityOrgasmGameResistCount
                        }
                    });
                    if (Player.ArousalSettings?.OrgasmStage == 1) {// 如果当前正在抵抗则添加难度并重新开始抵抗游戏
                        conDebug({
                            type: MSGType.DebugLog,
                            name: "捕捉到抵抗场景，开始截断抵抗 增加难度 并重新触发",
                            content: {
                                高潮阶段: Player.ArousalSettings?.OrgasmStage,
                                抵抗难度: ActivityOrgasmGameResistCount
                            }
                        });
                        // 增加抵抗难度
                        ActivityOrgasmGameResistCount++;
                        // 发送活动消息
                        SendActivity(`{target}紧闭双眼尽力抵抗着高潮，但被{source}的瘙痒干扰，从嘴巴里泄露出一声压抑的呻吟，不知是否还能忍住.`, SourceCharacter, TargetCharacter)
                        // 打断当前高潮
                        ActivityOrgasmStop(Player, 99.5);
                        // 触发新的高潮
                        ActivityOrgasmPrepare(Player);
                    }
                }
            }
            return next(args);
        });
    }

    //============================================================

    /**
     * 载入自定义动作
     */
    LoadActivity(): void {
        conDebug("加载自定义活动");
        let actLength = 0;
        for (const aN in this.activityToAddDict) { // a 为活动名

            this.pushToActivity(this.activityToAddDict[aN as XSA_ActivityName].act);

            this.activityDictAdd();

            //加载文字描述
            const activityDesc = this.activityToAddDict[aN as XSA_ActivityName].desc;

            activityDesc?.forEach((d) => {
                ActivityDictionary?.push(d);
            });
            actLength += 1;
        }
        conDebug(`自定义活动加载完成.动作数: ${actLength}`)
    }
    //============================================================
    /**
     * 初始化活动的文字描述。
     */
    activityDictAdd() {

        for (const a in this.activityToAddDict) {
            const pendingActivity = this.activityToAddDict[a as XSA_ActivityName];

            const actName = pendingActivity.act.Name;
            const nameWithoutPrefix = actName.substring(6);
            const actTarget = pendingActivity.act.Target;
            const actTargetSelf = pendingActivity.act.TargetSelf;

            const addedValues: string[][] = [];

            addedValues.push([`ActivityAct_${actName}`, `${nameWithoutPrefix}`]);
            addedValues.push([`Activity${actName}`, `${nameWithoutPrefix}`]);
            if (actTarget.length > 0) {
                for (let i = 0; i < actTarget.length; i++) {
                    const aT = actTarget[i];
                    addedValues.push([`Label-ChatOther-${aT}-${actName}`,
                    `${nameWithoutPrefix}${pendingActivity.isBase ? this.groupNameDict[aT as AssetGroupItemName] : ''}`]);
                    addedValues.push([`ChatOther-${aT}-${actName}`,
                    pendingActivity.descString[0].replace(this.bodyNamePlaceholder, this.groupNameDict[aT as AssetGroupItemName])]);
                }
            }
            if (typeof actTargetSelf !== 'undefined' && typeof actTargetSelf !== 'boolean' && actTargetSelf.length > 0) {
                for (const aTS of actTargetSelf) {
                    addedValues.push([`Label-ChatSelf-${aTS}-${actName}`,
                    `${nameWithoutPrefix}${pendingActivity.isBase ? this.groupNameDict[aTS as AssetGroupItemName] : ''}`]);
                    addedValues.push([`ChatSelf-${aTS}-${actName}`,
                    pendingActivity.descString[1].replace(this.bodyNamePlaceholder, this.groupNameDict[aTS as AssetGroupItemName])]);
                }
            }

            pendingActivity.desc = addedValues;
        }
    }
    /*
        'ItemAddon' | 'ItemArms' | 'ItemBoots' | 'ItemBreast' | 'ItemButt' |
        'ItemDevices' | 'ItemEars' | 'ItemFeet' | 'ItemHands' | 'ItemHead' |
        'ItemHood' | 'ItemLegs' | 'ItemMisc' | 'ItemMouth' | 'ItemMouth2' |
        'ItemMouth3' | 'ItemNeck' | 'ItemNeckAccessories' | 'ItemNeckRestraints' |
        'ItemNipples' | 'ItemNipplesPiercings' | 'ItemNose' | 'ItemPelvis' |
        'ItemTorso' | 'ItemTorso2' | 'ItemVulva' | 'ItemVulvaPiercings' |
        'ItemHandheld'
    */
    private readonly groupNameDict: { [name in AssetGroupItemName]: string } = {
        'ItemAddon': '身体(附加)', 'ItemArms': '手臂', 'ItemBoots': '脚', 'ItemBreast': '乳房',
        'ItemButt': '屁股', 'ItemDevices': '身体(装置)', 'ItemEars': '耳朵', 'ItemFeet': '小腿',
        'ItemHandheld': '手', 'ItemHands': '手', 'ItemHead': '头', 'ItemHood': '头发', 'ItemLegs': '大腿',
        'ItemMisc': '身体(杂项)', "ItemMouth": '嘴巴', 'ItemMouth2': '嘴巴', 'ItemMouth3': '嘴巴',
        'ItemNeck': '脖子', 'ItemNeckAccessories': '脖子', 'ItemNeckRestraints': '脖子', 'ItemNipples': '乳头',
        'ItemNipplesPiercings': '乳头', 'ItemNose': '鼻子', 'ItemPelvis': '小腹', 'ItemTorso': '肋部', 'ItemTorso2': '肋部',
        'ItemVulva': '阴道', 'ItemVulvaPiercings': '阴蒂'
    }
    private readonly bodyNamePlaceholder = '{group}'
    /**
     * 将传入的活动对象载入
     * @param activity 将要载入的活动对象
     */
    private pushToActivity(activity: Activity) {
        ActivityFemale3DCG.push(activity);
        ActivityFemale3DCGOrdering.push(activity.Name);
        //}
    }

    //============================================================

    //     ActivityNameXiaosu_onlyName =
    //     "眯眼" | "眼神飘忽" | "甩头发" | "轻抚发梢" | "叼起头发" | "嗅头发" |  "绕头发" | "大力甩头发" | "抿住嘴巴" | "恳求的看" | "恳求的摇头"
    //   | "皱鼻子" | "打喷嚏" | "深呼吸" 
    //   | "低头" | "挺胸收腹" | "站直身体" | "坐直身体" | "身体一颤"
    //   | "活动手臂" | "活动大腿" | "绷紧膝盖" | "内八夹腿"
    //   | "蜷缩脚趾" | "绷直脚踝" | "踮脚"
    // ;
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
     * @img - 指定的动作图片
     * @isBase - 是否是基础动作 基础动作将会自动把名称中的 @bodyNamePlaceholder 换成 `{group}` 并在添加动作时动态的将其替换为目标部位的名称
    */
    activityToAddDict: { [ActivityIndex in XSA_ActivityName]: { act: Activity, desc: null | string[][], descString: [string, string], img: ActivityName, isBase?: true } } = {
        XSAct_眯眼: {
            act: {
                Name: "XSAct_眯眼",
                Target: [],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}眯了眯眼.`],
            img: "RestHead"
        },
        XSAct_眼神飘忽: {
            act: {
                Name: "XSAct_眼神飘忽",
                Target: [],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}眼神飘忽的左看右看.`],
            img: "RestHead"
        },
        XSAct_甩头发: {
            act: {
                Name: "XSAct_甩头发",
                Target: [],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}甩动着头发.`],
            img: "RestHead"
        },
        XSAct_大力甩头发: {
            act: {
                Name: "XSAct_大力甩头发",
                Target: [],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}连连摇头，慌乱的甩动着头发.`],
            img: "RestHead"
        },
        XSAct_轻抚发梢: {
            act: {
                Name: "XSAct_轻抚发梢",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered", "TargetItemHoodCovered", "UseArms"]
            },
            desc: null,
            descString: [`${selfPlaceholder}轻柔抚动着${targetPlaceholder}的头发.`, `${selfPlaceholder}轻柔抚动着自己的头发.`],
            img: "RestHead"
        },
        XSAct_叼起头发: {
            act: {
                Name: "XSAct_叼起头发",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 50,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth", "ItemHoodCovered", "TargetItemHoodCovered"],
                StimulationAction: "Talk"
            },
            desc: null,
            descString: [`${selfPlaceholder}轻轻咬起${targetPlaceholder}的头发.`, `${selfPlaceholder}轻轻咬起自己的头发.`],
            img: "SiblingsCheekKiss"
        },
        XSAct_嗅头发: {
            act: {
                Name: "XSAct_嗅头发",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 30,
                MaxProgressSelf: 30,
                Prerequisite: ["ItemHoodCovered", "TargetItemHoodCovered", "ItemNoseCovered"],
                StimulationAction: "Talk"
            },
            desc: null,
            descString: [`${selfPlaceholder}在${targetPlaceholder}的发间嗅着，鼻息弥漫着${targetPlaceholder}的发香.`, `${selfPlaceholder}撩起自己的头发轻轻嗅着.`],
            img: "SiblingsCheekKiss"
        },
        XSAct_绕头发: {
            act: {
                Name: "XSAct_绕头发",
                Target: ["ItemHood"],
                TargetSelf: ["ItemHood"],
                MaxProgress: 30,
                MaxProgressSelf: 30,
                Prerequisite: ["UseArms", "ItemHoodCovered", "TargetItemHoodCovered"]
            },
            desc: null,
            descString: [`${selfPlaceholder}勾起一缕${targetPlaceholder}的发丝，在指尖绕来绕去.`, `${selfPlaceholder}勾起自己的一缕头发在指尖绕来绕去.`],
            img: "SiblingsCheekKiss"
        },
        XSAct_皱鼻子: {
            act: {
                Name: "XSAct_皱鼻子",
                Target: [],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered", "ItemNoseCovered"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}皱了皱自己的鼻头.`],
            img: "RestHead"
        },
        XSAct_打喷嚏: {
            act: {
                Name: "XSAct_打喷嚏",
                Target: [],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth", "ItemHoodCovered"],
                StimulationAction: "Talk"
            },
            desc: null,
            descString: ["", `${selfPlaceholder}打了个喷嚏.`],
            img: "Kiss"
        },
        XSAct_深呼吸: {
            act: {
                Name: "XSAct_深呼吸",
                Target: [],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth", "ItemHoodCovered", "ItemNoseCovered"],
                StimulationAction: "Talk"
            },
            desc: null,
            descString: ["", `${selfPlaceholder}深深的吸了口气.`],
            img: "Kiss"
        },
        XSAct_低头: {
            act: {
                Name: "XSAct_低头",
                Target: [],
                TargetSelf: ["ItemHood"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["ItemHoodCovered", "MoveHead"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}红润着脸蛋低头逃避.`],
            img: "RestHead"
        },
        XSAct_恳求的摇头: {
            act: {
                Name: "XSAct_恳求的摇头",
                Target: ["ItemHead"],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["MoveHead"]
            },
            desc: null,
            descString: [`${selfPlaceholder}对着${targetPlaceholder}的方向恳求的摇头.`, ``],
            img: "RestHead"
        },
        XSAct_恳求的看: {
            act: {
                Name: "XSAct_恳求的看",
                Target: ["ItemHead"],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["TargetZoneNaked", "MoveHead"]
            },
            desc: null,
            descString: [`${selfPlaceholder}汪着眼睛恳求的看着${targetPlaceholder}.`, ""],
            img: "RestHead"
        },
        XSAct_内八夹腿: {
            act: {
                Name: "XSAct_内八夹腿",
                Target: [],
                TargetSelf: ["ItemLegs"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}通红的脸蛋忍耐着快感，大腿紧紧夹起来，摆出着内八的姿势，身体微微颤抖.`],
            img: "Kick"
        },
        XSAct_噘嘴: {
            act: {
                Name: "XSAct_噘嘴",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}有些不满的噘起嘴巴.`],
            img: "PoliteKiss"
        },
        XSAct_抿住嘴巴: {
            act: {
                Name: "XSAct_抿住嘴巴",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}抿住嘴巴.`],
            img: "PoliteKiss"
        },
        XSAct_瘪嘴: {
            act: {
                Name: "XSAct_瘪嘴",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}瘪着嘴巴，一副委屈的样子.`],
            img: "PoliteKiss"
        },
        XSAct_坐直身体: {
            act: {
                Name: "XSAct_坐直身体",
                Target: [],
                TargetSelf: ["ItemTorso", "ItemTorso2"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}挺直了腰，坐直了身体.`],
            img: "Kick"
        },
        XSAct_挺胸收腹: {
            act: {
                Name: "XSAct_挺胸收腹",
                Target: [],
                TargetSelf: ["ItemBreast"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}挺起胸部，微收下巴，腹部用力收腰.`],
            img: "Kick"
        },
        XSAct_站直身体: {
            act: {
                Name: "XSAct_站直身体",
                Target: [],
                TargetSelf: ["ItemTorso", "ItemTorso2"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["NotKneeling"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}挺胸收腹，努力绷紧小腿，站直了身体.`],
            img: "Kick"
        },
        XSAct_身体一颤: {
            act: {
                Name: "XSAct_身体一颤",
                Target: [],
                TargetSelf: ["ItemTorso", "ItemTorso2"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}的身体猛然颤抖了一下.`],
            img: "Kick"
        },
        XSAct_活动大腿: {
            act: {
                Name: "XSAct_活动大腿",
                Target: [],
                TargetSelf: ["ItemLegs"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}尝试活动了一下腿部.`],
            img: "Kick"
        },
        XSAct_活动手臂: {
            act: {
                Name: "XSAct_活动手臂",
                Target: [],
                TargetSelf: ["ItemArms"],
                MaxProgress: 30,
                MaxProgressSelf: 30,
                Prerequisite: ["CantUseArms"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}一边按摩一边活动着手臂.`],
            img: "MasturbateHand"
        },
        XSAct_绷紧膝盖: {
            act: {
                Name: "XSAct_绷紧膝盖",
                Target: [],
                TargetSelf: ["ItemLegs"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["NotKneeling"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}努力的绷紧膝盖，尽可能站的更直.`],
            img: "Kick"
        },
        XSAct_绷直脚踝: {
            act: {
                Name: "XSAct_绷直脚踝",
                Target: [],
                TargetSelf: ["ItemBoots"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: [],
            },
            desc: null,
            descString: ["", `${selfPlaceholder}不自觉的用力绷直脚踝，释放涌来的快感.`],
            img: "Kick"
        },
        XSAct_蜷缩脚趾: {
            act: {
                Name: "XSAct_蜷缩脚趾",
                Target: [],
                TargetSelf: ["ItemBoots"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: [],
            },
            desc: null,
            descString: ["", `${selfPlaceholder}脚趾互相纠结，又时而蜷缩，忍耐着快感袭来.`],
            img: "Kick"
        },
        XSAct_踮脚: {
            act: {
                Name: "XSAct_踮脚",
                Target: [],
                TargetSelf: ["ItemBoots"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["CantUseFeet"],
            },
            desc: null,
            descString: ["", `${selfPlaceholder}努力的踮起脚.`],
            img: "Kick"
        },
        XSAct_兴奋的伸出舌头: {
            act: {
                Name: "XSAct_兴奋的伸出舌头",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}兴奋的伸出舌头.}`],
            img: "MasturbateTongue"
        },
        XSAct_兴奋的扭动: {
            act: {
                Name: "XSAct_兴奋的扭动",
                Target: [],
                TargetSelf: ["ItemTorso", "ItemTorso2"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ['', `${selfPlaceholder}兴奋的扭动着身体.`],
            img: 'Wiggle'
        },
        XSAct_呼吸平复: {
            act: {
                Name: "XSAct_呼吸平复",
                Target: [],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}的呼吸渐渐平复.`],
            img: "PoliteKiss"
        },
        XSAct_呼吸紊乱: {
            act: {
                Name: "XSAct_呼吸紊乱",
                Target: [],
                TargetSelf: ["ItemNose"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}的呼吸渐渐紊乱起来，发出软软的鼻音.`],
            img: "Whisper"
        },
        XSAct_嘟囔着想说什么: {
            act: {
                Name: "XSAct_嘟囔着想说什么",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}嘟囔着想说什么.`],
            img: "Whisper"
        },
        XSAct_失神的伸出舌头: {
            act: {
                Name: "XSAct_失神的伸出舌头",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}失神的伸出自己的舌头.`],
            img: "MasturbateTongue"
        },
        XSAct_慢慢伸出舌头: {
            act: {
                Name: "XSAct_慢慢伸出舌头",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["UseMouth"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}慢慢的伸出了自己的舌头.`],
            img: "MasturbateTongue"
        },
        XSAct_微微摇头: {
            act: {
                Name: "XSAct_微微摇头",
                Target: [],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}微微的摇了摇头.`],
            img: "Suck"
        },
        XSAct_微微点头: {
            act: {
                Name: "XSAct_微微点头",
                Target: [],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}微微的点了点头.`],
            img: "Nod"
        },
        XSAct_身体颤抖的摇头: {
            act: {
                Name: "XSAct_身体颤抖的摇头",
                Target: [],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}浑身颤抖的摇了摇头.`],
            img: "Suck"
        },
        XSAct_身体颤抖的点头: {
            act: {
                Name: "XSAct_身体颤抖的点头",
                Target: [],
                TargetSelf: ["ItemHead"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}浑身颤抖的点了点头.`],
            img: "Nod"
        },
        XSAct_歪头疑惑: {
            act: {
                Name: "XSAct_歪头疑惑",
                Target: [],
                TargetSelf: ["ItemNeck"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}歪着脑袋一副疑惑的样子.`],
            img: "Suck"
        },
        XSAct_扭动身体: {
            act: {
                Name: "XSAct_扭动身体",
                Target: [],
                TargetSelf: ["ItemTorso", "ItemTorso2"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}扭动着身体.`],
            img: "Wiggle"
        },
        XSAct_活动四肢: {
            act: {
                Name: "XSAct_活动四肢",
                Target: ['ItemArms', 'ItemLegs', 'ItemFeet', 'ItemBoots'],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ["CantUseArms", "CantUseFeet"]
            },
            desc: null,
            descString: ["", `${selfPlaceholder}活动了下自己的四肢.`],
            img: "Slap"
        },
        XSAct_看他: {
            act: {
                Name: "XSAct_看他",
                Target: ['ItemHead'],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['CanLook']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}看向了${targetPlaceholder}.`],
            img: "SiblingsCheekKiss"
        },
        XSAct_缩脖子: {
            act: {
                Name: "XSAct_缩脖子",
                Target: [],
                TargetSelf: ["ItemNeck"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}缩了下自己的脖子.`],
            img: "Suck"
        },
        XSAct_脸红喘气: {
            act: {
                Name: "XSAct_脸红喘气",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}面色潮红的喘着气.`],
            img: "Whisper"
        },
        XSAct_轻声喘气: {
            act: {
                Name: "XSAct_轻声喘气",
                Target: [],
                TargetSelf: ["ItemMouth", "ItemMouth2", "ItemMouth3"],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: ["", `${selfPlaceholder}轻声喘着气.`],
            img: "Whisper"
        },
        XSAct_跺脚: {
            act: {
                Name: "XSAct_跺脚",
                Target: [],
                TargetSelf: ['ItemBoots'],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['NotKneeling']
            },
            desc: null,
            descString: ["", `${selfPlaceholder}跺了跺脚.`],
            img: "Step"
        },
        XSAct_头蹭: {
            act: {
                Name: "XSAct_头蹭",
                Target: ['ItemHead', 'ItemNeck', 'ItemBreast', 'ItemArms', 'ItemLegs', 'ItemFeet', 'ItemBoots', 'ItemPelvis'],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: [`${selfPlaceholder}用自己的脑袋蹭了蹭${targetPlaceholder}的${this.bodyNamePlaceholder}.`, ''],
            img: "SiblingsCheekKiss",
            isBase: true
        },
        XSAct_脸蹭: {
            act: {
                Name: "XSAct_脸蹭",
                Target: ['ItemHead', 'ItemNeck', 'ItemBreast', 'ItemArms', 'ItemLegs', 'ItemFeet', 'ItemBoots', 'ItemPelvis'],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: []
            },
            desc: null,
            descString: [`${selfPlaceholder}用自己的脸颊蹭了蹭${targetPlaceholder}的${this.bodyNamePlaceholder}.`, ''],
            img: "SiblingsCheekKiss",
            isBase: true
        },
        XSAct_鼻子蹭: {
            act: {
                Name: "XSAct_鼻子蹭",
                Target: ['ItemHead', 'ItemNeck', 'ItemBreast', 'ItemArms', 'ItemLegs', 'ItemFeet', 'ItemBoots', 'ItemPelvis'],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: [`${selfPlaceholder}用自己的鼻子蹭了蹭${targetPlaceholder}的${this.bodyNamePlaceholder}.`, ''],
            img: "Nod",
            isBase: true
        },
        XSAct_埋怀里: {
            act: {
                Name: "XSAct_埋怀里",
                Target: ['ItemBreast'],
                TargetSelf: [],
                MaxProgress: 20,
                MaxProgressSelf: 20,
                Prerequisite: ['MoveHead']
            },
            desc: null,
            descString: [`${selfPlaceholder}把脑袋埋在${targetPlaceholder}的怀里.`, ''],
            img: "SiblingsCheekKiss"
        }
    }



    /**
     * 前置条件字典
     * @PrerequisiteName - 需要是在{@link XSA_ActivityPrerequisite}的字符串
     * @Name - 需要是在{@link XSA_ActivityPrerequisite}的字符串
     * @Action - 检测判断的具体动作
     * - @param args - 一个数组,包含四个元素.
     * - args[0]为@param prereq:{@link ActivityPrerequisite} 判定决定使用哪个条件的依据，但此处无用 请不要在这里使用该参数
     * - args[1]为@param acting:{@link Character} | {@link PlayerCharacter} 代表动作发起者的数据
     * - args[2]为@param acted:{@link Character} | {@link PlayerCharacter} 代表动作目标的数据
     * - args[3]为@param group:{@link AssetGroup}.
     */
    prerequisiteDict: { [PrerequisiteName in XSA_ActivityPrerequisite]: prerequisite } = {
        ItemHoodCovered: { //头部面罩位置是否覆盖
            Name: "ItemHoodCovered",
            Action: (args) => {
                //const prereq = args[0] as ActivityPrerequisite;
                const acting = args[1] as Character | PlayerCharacter;
                //const acted = args[2] as Character | PlayerCharacter;
                //const group = args[3] as AssetGroup;

                return this.Judgment.ItemHoodCovered(acting);
            }
        },
        TargetItemHoodCovered: { //目标的头部面罩位置是否覆盖
            Name: "TargetItemHoodCovered",
            Action: (args) => {
                const acted = args[2] as Character | PlayerCharacter;

                return this.Judgment.ItemHoodCovered(acted);
            }
        },
        ItemNoseCovered: { //头部鼻子位置是否覆盖
            Name: "ItemNoseCovered",
            Action: (args) => {
                const acting = args[1] as Character | PlayerCharacter;

                return this.Judgment.ItemNoseCovered(acting);
            }
        },
        Kneeling: {
            Name: "Kneeling",
            Action: (args) => {
                const acting = args[1] as Character | PlayerCharacter;

                return this.Judgment.Kneeling(acting);
            }
        },
        NotKneeling: {
            Name: "NotKneeling",
            Action: (args) => {
                const acting = args[1] as Character | PlayerCharacter;

                return this.Judgment.NotKneeling(acting);
            }
        },
        CanLook: {
            Name: "CanLook",
            Action: (args) => {
                const acting = args[1] as Character | PlayerCharacter;

                return this.Judgment.CanLook(acting);
            }
        }
    }
    /**
     * 判断函数字典
     * 前置条件字典将要调用的方法集合
    */
    Judgment: { [judgmentName: string]: (acting: Character | PlayerCharacter, acted?: Character | PlayerCharacter, group?: AssetGroup) => boolean } = {
        ItemHoodCovered: (acting: Character | PlayerCharacter): boolean => { // 头部面罩位置是否覆盖 // 尝试修复
            return InventoryPrerequisiteMessage(acting, "HoodEmpty") === "";
        },
        ItemNoseCovered: (acting: Character | PlayerCharacter): boolean => { // 鼻子位置是否覆盖 // 测试
            return (InventoryGet(acting, 'ItemNose') ? "CannotBeUsedOverMask" : "") === "";
        },
        Kneeling: (acting: Character | PlayerCharacter): boolean => { // 是否跪着
            return (acting as PlayerCharacter).IsKneeling();
        },
        NotKneeling: (acting: Character | PlayerCharacter): boolean => { // 是否跪着
            return !(acting as PlayerCharacter).IsKneeling();
        },
        CanLook: (acting: Character | PlayerCharacter): boolean => { // 是否可以看到
            return (acting as PlayerCharacter).IsBlind();
        }

    }


    public getAllAct(): XSA_ActivityName_onlyName[] {
        const result: XSA_ActivityName_onlyName[] = []
        for (const a in this.activityToAddDict) {
            const suffix = a.substring(6) as XSA_ActivityName_onlyName; // 从索引为 6 的位置开始截取到字符串末尾
            result.push(suffix); // 输出：XXXX
        }
        conDebug({
            content: result,
            name: "ActivityNameXiaosu_onlyName",
            type: MSGType.DebugLog
        });
        return result;
    }
}
